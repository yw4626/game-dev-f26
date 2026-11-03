# 地图生成、挖洞下层与可破坏物：v0.4静态调查

2026-10-28。此次只读调查补充 [第一人称探索证据](EXPLORATION_EVIDENCE.md)。没有启动原版、附加进程或修改安装文件。通过现有Ghidra工程执行三批 `-readOnly -noanalysis`，导出35个定点函数及协程；三批均正常退出并丢弃数据库更改。主要材料在 [evidence/exploration-v4](evidence/exploration-v4/)，配置研究另见 [evidence/exploration-v4-config](evidence/exploration-v4-config/)。

## 文件身份与方法

二进制 `GameAssembly.dll` SHA-256为 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`；元数据SHA-256为 `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。本次 [inspect-fields.cjs](evidence/exploration-v4/inspect-fields.cjs) 重新检查当前文件哈希，再使用已有REA元数据证据 `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35` 恢复字段偏移。

函数名和ABI来自工作区已有元数据索引，字段映射记录在 [field-offsets.json](evidence/exploration-v4/field-offsets.json)。这些是静态代码观察，不是原版运行时逐帧验证。协程反编译中存在未命名辅助调用、泛型共享体和异常路径恢复噪声；本报告不以入口名字代替函数体证据。

## 地图生成

资源中MadForest第一层的生成层顺序为RoomSpring → PathMinimumSpanningTree → Metadata → Event → Border → Prop → MapInstantiation → LightSource。这是指定配置的观察，不能推为所有原版关卡都采用同一布局算法。

| 部分 | 已观察到的实现 | 证据 |
|---|---|---|
| 房间图候选边 | BuildDelaunayGraph协程实际调用 `DelaunatorSharp.Delaunator..ctor`（0x1806e8620），遍历三角形/half-edge关系，使用规范化的两端索引记录边。 | [0x182896080](evidence/exploration-v4/details/0x182896080.c) |
| 边权 | 对每条候选边调用距离辅助函数，计算两端房间出口朝向排名，再以两个倍率乘距离得到边权，最后排序。 | [CalculateEdgeWeights 0x182896f30](evidence/exploration-v4/details/0x182896f30.c) |
| 排名倍率 | rank=0返回 `_badConnectionWeightScale`，rank=1返回 `_okConnectionWeightScale`，rank=2返回1；其他值进入异常分支。 | [ConnectionRankingToScale 0x182884c30](evidence/exploration-v4/semantics/0x182884c30.c) |
| 连通主骨架 | 逐条遍历排序边，FindParent两端不同才Union并加入MST；达到房间数−1条边后停止。随后单独收集未使用边。 | [BuildMinimumSpanningTree 0x182896640](evidence/exploration-v4/details/0x182896640.c) |
| 回路 | 额外边来自unused edges。计算边线段到地图中心的最近点距离d；d在 `_middleZoneRadius` 内必选，外侧以 `maxExtraEdgeSelectionChance * (1-d/maxDistanceFromCenter)` 与随机值比较。不是固定添加N条边。 | [FindExtraEdgesFromUnused 0x1828985e0](evidence/exploration-v4/details/0x1828985e0.c)；最近点辅助函数0x18267de00对应NBUtil.ClosestPointToLine |
| 出生点 | 遍历房间内候选点，读取输入流场值并增加prioritySpawnTag加分（输入流场最大值的2倍），保留最高评分。输入流场的所有构造前置未全量追踪。 | [FindBestSpawnCoords 0x1828719b0](evidence/exploration-v4/0x1828719b0.c) |
| 首领候选 | 遍历房间模板中的指定事件空间并映射到世界格子坐标，找到后记录boss坐标。不能简单归纳为“永远挑离出生点最远的格子”。 | [FindBossCoords 0x182871d90](evidence/exploration-v4/0x182871d90.c) |

因此原型采用“房间、连通骨架、可选回路、主支路事件”的结构有证据基础；如果没有复现Delaunay、完整房间模板、弹簧排布、出口评分和走廊寻路，仍应称为受原版结构指导的近似生成器。原型每个种子的具体地图不应宣称与原版一致。

## 铲子挖洞与下层

### 铲子出现条件

[TrySpawnShovel协程 0x182900030](evidence/exploration-v4/details/0x182900030.c) 先检查当前层 `HasCustomEndingSequence`，为真时不生成。随后扫描 `IsFloorExit` 格；该出口必须存在、`IsEventCleared=true`且`HasEvent=true`。若已有active shovel则不再生成。它使用全局 `DestructibleShovelProp` 在出口坐标附近生成铲子，并包含视角相关偏移；不是允许玩家在任意地板位置挖下一层。

### 一次交互开启完整序列

铲子碰撞入口先拒绝 `_isDestroyed` 或 `_isBumping`。一次有效交互开启Dig协程并设bumping；随后动画自动循环，并不是要求玩家按3次才完成。

[Dig.MoveNext 0x1828daef0](evidence/exploration-v4/0x1828daef0.c) 的重要顺序：

1. 注册暂停菜单与牌盒blocker。
2. 读取全局descendShovelConfig与当前FloorLayerConfig。
3. 若可进入下一层，注册movement locker、播放下降动画，并调度DelayedDescendFloor。
4. 循环播放挖掘动画，直到 `_timesDug` 达到配置次数；每次动画完成回调分发金币。
5. 关闭铲子对象，SetDestroyed，清除bumping，解除相关blocker。

[DelayedDescendFloor.MoveNext 0x1828da990](evidence/exploration-v4/0x1828da990.c) 等待指定延迟，然后调用 `TryMoveToNextDungeonFloor`。原版下降时序还包含速度调整与遮罩动画，不能把2.5秒直接描述为所有情况下精确的楼层切换时刻。

已提取的全局配置是 `DigAnimationTotalTime=2.5`、`TriggerCoverTime=2.4`、`NumberTimesToDig=3`、退场Duration=0.5；MadForest已检查层的floorCoinBonus为100。具体配置出处见并行配置报告及原 `reverse_engineering/vampire-crawlers/configs/decoded-configs.json`。

### 精确金币分配

Dig初始化 `base = floorCoinBonus / NumberTimesToDig`，这里是整数除法。[动画回调 0x1828e4020](evidence/exploration-v4/details/0x1828e4020.c) 先增加timesDug，然后计算：

```text
coins = base
if timesDug == N:
    coins += floorCoinBonus - N * base
PlayerModel.AddCoins(coins, useGreed=true)
```

因此100金币、3次挖掘的**基础**分配为33、33、34，不会丢失余数。[AddCoins 0x182942e40](evidence/exploration-v4/semantics/0x182942e40.c) 确认useGreed为真时先调用Greed调整函数，因此有Greed的原版角色最终到账不一定恰好100。原型未实现Greed时可以直接使用这三个基础值。

挖掘中断/存档恢复的完整原版规则本次未恢复；可恢复的digging阶段、逐步保存已发金币索引、刷新后只补发剩余奖励，是原型为浏览器环境增加的可靠性处理，不能冒充原版存档行为。

## 可破坏物、掉落和拾取

| 类型 | 已确认规则 | 证据 |
|---|---|---|
| 通用完成状态 | SetDestroyed写 `_isDestroyed=true`，发DestructibleStateChanged与DestructibleBroken事件。未在函数中直接刷新全部容器随机掉落。 | [0x18289f410](evidence/exploration-v4/0x18289f410.c) |
| 金币与鸡肉防重入 | bump入口拒绝已destroyed或正在bumping；启动一次异步效果，再标记bumping。效果完成后禁用对象、SetDestroyed、清除bumping并保存。 | [金币入口](evidence/exploration-v4/0x1828ccc90.c)、[金币协程](evidence/exploration-v4/details/0x1828de400.c)、[鸡肉入口](evidence/exploration-v4/0x1828a1050.c)、[鸡肉协程](evidence/exploration-v4/details/0x1828b0cc0.c) |
| 金币范围 | 金币协程调用NextInt(min,max+1)。NextInt实际公式为 `floor(uint32Random * (max-min) / 2^32) + min`，上界排除，因此物件配置的min/max两端均可得到。配置2..10表示包含2和10。 | [金币协程](evidence/exploration-v4/details/0x1828de400.c)、[NextInt 0x18269b260](evidence/exploration-v4/semantics/0x18269b260.c) |
| 鸡肉 | 从 `_amountToHeal` 读取治疗量，经过 `ArcanaModel.TryApplyArcana_ExperimentalMedicine` 分支，再给生命SimpleStat.AddValue。并行资源检查的两个鸡肉prefab该值都是10。原型无该Arcana时按基础10治疗。 | [鸡肉协程](evidence/exploration-v4/details/0x1828b0cc0.c)、配置目录bundle-configs.json |
| 分阶段容器 | DestructibleEffects按 `_destructStage` 选择效果数组。非最后阶段结束后解除bumping，允许下次碰撞；最后阶段启动下一组对象、关闭原对象并SetDestroyed，每次stage递增。不是所有原版容器都固定一击或固定两击。 | [OnBumpedSequence 0x1828dc360](evidence/exploration-v4/details/0x1828dc360.c)、[TurnOnNextObjects协程](evidence/exploration-v4/semantics/0x1828e1f70.c) |
| 家具 | bump同样拒绝destroyed/bumping；按 `_timeBeforeMarkedAsDestroyed` 延迟后SetDestroyed，另有晃动与溶解字段。 | [家具入口](evidence/exploration-v4/0x1828d09b0.c)、[DelayedSetDestroyed 0x1828dac60](evidence/exploration-v4/details/0x1828dac60.c) |
| 加权选择 | DestructibleClusterSpawner先过滤通过解锁条件的候选，累加权重，NextInt(0,total)，再累计权重直到 `random+1<=cumulative` 返回对应项。 | [SelectedWeightedRandomDrop 0x1828a16e0](evidence/exploration-v4/0x1828a16e0.c) |

“破坏容器后出现掉落物，再拾取”的原型实现与阶段化启用下一物体的结构兼容。但某个具体烛台/桶的阶段数、是否允许spam bump、拾取动画/粒子分支应以对应prefab配置为准。不能仅看到金币75/鸡肉25权重就断言每个可破坏物都独立有25%鸡肉率：生成还有优先列表、解锁条件和鸡肉数量限制。

## 暗门：证据边界

对完整已有方法索引中 `Nosebleed.Pancake` 命名空间进行Secret、Hidden、Door、Wall检索，没有找到专属地牢暗门/破墙方法。检索命中主要是UI隐藏、卡牌传送等无关入口。这个**有限名称搜索不能证明原版没有暗门**，它可能通过房间模板、普通Unity组件、可破坏物启用列表或事件组合实现。

本次没有恢复一条“发现裂缝→开暗门→接入秘密房间”的原版控制流，也未发现可靠的原版暗门概率、提示、费用或奖励公式。原型若添加裂墙、F交互、隐藏房间、开门后小地图揭示，应明确标为新增探索内容。DestructibleEffects的enable-next-object机制只提供一种可能实现方式，不构成暗门机制的证据。

## 本轮完成度

- **已回答**：铲子出现主要门槛、一次交互自动挖掘、基础金币余数分配、防重入、金币随机端点、鸡肉基础治疗来源、阶段化破坏、MST并查集连通与额外回路决策。
- **部分回答**：原版地图生成。已有真实Delaunay/MST控制流及配置层顺序，但房间模板布局、弹簧迭代、走廊寻路、失败重试尚未完全恢复。
- **未确认**：原版暗门专属机制、挖掘中所有存档/退出路径、原版所有可破坏物类别及每个关卡的生成分布。原型对此采用明确标注的近似或新增设计。
