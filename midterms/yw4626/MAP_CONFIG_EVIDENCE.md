# 地图与探索配置证据（2026-10-28）

本报告记录本机 Vampire Crawlers 已发布资源中的配置；它不是原游戏源码，也不是本次运行时采集。配置能够确认数值、对象引用和所声明的生成层，不能独自证明分支、执行顺序或概率抽样算法。原型的房间散布、MST 连线和网格走廊仍是近似实现。

## 来源与复查方式

原安装：`D:\steam_data\steamapps\common\Vampire Crawlers`。本次只读资源，没有修改安装，没有运行游戏，没有复制原版贴图或音频。

证据目录：`evidence/exploration-v4-config/`。

| 文件 | 用途 |
| --- | --- |
| `extract.py`、`configs.json` | 定点解析 globalgamemanagers.assets、sharedassets0.assets、sharedassets3.assets、level3；686 条记录 |
| `extract-bundles.py`、`bundle-configs.json` | 解析 Unity 默认资源、MonoScript 元数据、biome-shared 和 biome-madforest bundles；198 条组件记录 |
| `sources.json`、`bundle-sources.json` | 精确源路径、字节数和 SHA256 |
| `errors.json`、`bundle-errors.json` | 3 条 PropDefinitionDatabase 泛型树失败；bundle 解析无失败 |
| `implementation-inputs.json` | 可供复现使用的精简原记录，包含字段、对象 ID 和对象 SHA256 |

每条成功记录保存所在资源文件/CAB、path_id、类型、对象字节长度、原始对象 SHA256。MonoBehaviour 的脚本指针与 UnityPy 读取的原生头核对；Odin 数据保存已消费/总字节数，本次所有 Odin 记录均完整消费。Unity 曲线中的非有限浮点数编码为 `{"$nonfinite":"inf"}` 等对象，所有 JSON 都可严格解析。三个失败对象是 sharedassets0 的 path 31666、32897、33415，均为 PropDefinitionDatabase；个别 PropDefinition 已成功解析。

以下无特别说明的 path_id 都属于 `globalgamemanagers.assets`，只在该资源中有效。

## MadForest_01 地图配置

`DungeonGenConfig_MadForest_01`（7667）引用四层 FloorLayerConfig（7669、7670、7671、7672）。这是一个具体关卡配置，不能推广为所有关卡规则。四层的 `_floorCoinBonus=100`，敌人生命/伤害倍率均为 1，`_forceDisableMinimap=0`。

第一层声明的生成层顺序为：RoomSpring（7679）→ PathMinimumSpanningTree（7678）→ Metadata（7708）→ Event（7674）→ Border（7673）→ Prop（7709）→ MapInstantiation（7707）→ LightSource（7704）。配置序列本身不等同于已经验证所有层的运行行为。

| 层 | RoomSpring ID | targetDungeonSize | maximumPossibleDungeonSize | roomRequirements |
| --- | --- | --- | --- | --- |
| F1 | 7679 | 5×5 | 6×6 | 2 个非终点 2×2；1 个终点 2×3/3×3 |
| F2 | 7680 | 6×6 | 8×8 | 1 个 GemHammer 标签房间；2 个非终点 2×2；1 个终点 2×3/3×3 |
| F3 | 7681 | 5×5 | 7×7 | 3 个非终点 2×2；1 个终点 2×3/3×3 |
| F4 | 7682 | 6×6 | 8×8 | 2 个非终点 2×2；1 个非终点 2×3/3×3；1 个终点 2×3/3×3 |

表中的尺寸是原字段值，尚未证明其与最终可行走格数一一相等。房间选择器中的标签为 Tag_Room_2x2（7694）、Tag_Room_Multi_2x3-3x3（7700）、Tag_End（7688）；非终点通过 Tag_End 的 inverted 标志表达。不能把多尺寸标签解释为两个房间。F2 的特殊标签为 Tag_Relic_GemHammer（7692）。

默认 RoomSpring 配置（7665）保留了真实弹簧迭代参数：

| 字段 | 数值 |
| --- | --- |
| badExitDirectionAngleThreshold / mapBoundingBoxBorder / initialPositionOffset | 90 / 2 / 5 |
| initialSpringLoopIterations / secondPassSpringLoopIterations | 200 / 200 |
| neighbourhoodDistance / targetNeighbourSeparation | 3.5 / 1.75 |
| separationSpringStrength / boundarySpringStrength | 40 / 50 |
| boundarySpringPadding / centrePullSpringStrength | 0.1 / 0.5 |
| dampeningStrength / springIntegrationDeltaTime | 10 / 0.01 |
| allowedUncontainedRooms / allowedUncontainedCells | 1 / 4 |

这些字段支持“原版使用弹簧房间生成配置”的判断；随机散布中心点不是该算法的精确重建。

共享 PathMSTLayer（7678）：`defaultTraversalCost=0.5`，`roomPadding=0`，`roomPaddingTraversalCost=0.25`，`travelledPathCostScale=0.5`，`okConnectionWeightScale=1.5`，`badConnectionWeightScale=2`，`maximumLength=8`，`middleZoneRadius=2.5`，`maxExtraEdgeSelectionChance≈0.85`。Odin 的 distanceHeuristic 是 StraightPathHeuristic，`turnPenalty=1`。最大额外边选择参数不是“每条边固定 85% 概率”的证据。

Metadata（7708）：`prioritySpawnTag=Tag_Spawn(7703)`，`roomTag=7693`，`corridorTag=7687`，`offPathDifficultyInitialScale=0.75`，`offPathDifficultyMaxScale≈0.9`，`maximumValidPathSegmentLength=5`。本轮没有从配置确认出口的具体选择距离或种子的初始化与重放规则。

F1 Event（7674）：`targetTemplateEncounterNumber=7`，bossEvent 指向 Encounter_15B1BE，界面详情覆盖为 EventDetails_EliteEncounter；`numberOfSideEventsToSpawn=1`，侧事件配置为 DestructibleEventConfig_EvoStatue；`maxAmbushes=0`。`overrideAmbushChance=false`，所以不能把闲置的 `ambushChanceOverride=0.01` 当作真实伏击概率。

## 可破坏物与掉落

| 楼层 | LightSource ID | 优先掉落列表 | 随机表 |
| --- | --- | --- | --- |
| MF1 F1 | 7704 | 空 | Coin 权重 75；Chicken 权重 25，Chicken 上限 1 |
| MF1 F2/F4 | 7705 | Chicken（7663） | 仅 Coin（7664），权重 85 |
| MF1 F3 | 7706 | 空 | Coin 权重 75；Chicken 权重 25，Chicken 上限 1 |

三份配置均有 `randomLightSourceRange=(4,5)`、`lightSourceCoinRange=(2,10)`、`randomBumpableFurnitureRange=(0,0)`。灯源数量范围的端点及优先掉落消耗格位方式尚未由本报告证明。F3 资源虽然命名 Chicken2，但实际鸡肉上限仍为 1，不能依命名推断掉落两份。达到随机鸡肉上限后如何重选，应以原生逻辑为准。

原生分析同伴已核对金币协程（0x1828de400）调用 RNG(min,max+1)，因此金币范围 2～10 两端包含。该结论不能自动类推到灯源数量范围。

鸡肉预制体在 `biome-shared_assets_all.bundle` 的 `CAB-ae4847204a3df06b8f66d553f79948c5`：

- DestructibleChicken path `-114680145975200460`，对象 SHA256 `49c06fd4dd577115e4a3779a1bf12ff3afcabfd6d8368b293b8c84be36830350`。
- 另一份 path `6161358251521927770`，对象 SHA256 `6eef9394ace85344ea5c7e316d698029278234bf767a5e003be3918aae4a87a8`。
- 两份均 `_amountToHeal=10`、`_destructibleType=2`、`_canForceTurnPlayer=1`、动画时间 0.5。

原生鸡肉协程（0x1828b0cc0）读取 amountToHeal，再经过角色管理器修正分支后增加生命。故 10 是基础治疗数值；本报告没有完整证明所有角色修正、上限和增益组合。

同 bundle 的金币预制体还存在自身范围 (1,1) 和金币袋 (10,10)；它们与灯源生成层的覆盖范围 (2,10) 应分别记录。

sharedassets0 中还存在 AbandonedCart（32156）、AbandonedCart_AlwaysMana（32157）、EvoStatue（32158）、ManaStatue（32159）事件配置。Evo/Mana 配置有 `requireNonExitEdge=1`；这能证明这些事件类型的存在，不能证明它们属于暗门机制。

## 铲子与下层

GlobalConfig（7720，对象 SHA256 `2487f88bb55f9e72567c0b8c1ac25a9754aa2c3a6a078f47f1f4b9c3dadaa9fe`）的 `descendShovelConfig`：

- DestructibleShovelProp 指向 Shared_Shovel（7824）。
- `DigAnimationTotalTime=2.5`，`TriggerCoverTime≈2.4`，`NumberTimesToDig=3`。
- `Duration=0.5`，`Ease=4`，`ScaleTarget=(0,0,0)`。

Shared_Shovel 的 Addressable GUID 为 `b82b385def8784a42bceaf0e109b522c`。同一共享 bundle 的 DestructibleShovel path `105587228878986691`，对象 SHA256 `ad14a03a198759c8614f50f1be32a91d51b05a48ad16b3aadab8026cc16c0398`，类型为 1，动画速度 1.2，生成动画速度 1.0。

配置本身确认三次挖掘与每层奖励 100；原生分析同伴另确认挖掘回调按 **33、33、34** 发放，合计 100。铲子出现条件、具体落点、最后一层如何结束应以配套原生分析为准。本报告不把铲子解释为任意位置使用的库存消耗品。

## 暗门与尚未确认的内容

在这次定点选出的 686 个配置记录、198 个 bundle 记录的类型和名称中，`secret|hidden|door|breakablewall` 查询没有命中。这是有边界的名称搜索，不能证明整个游戏不存在暗门；未知机制可能没有这些名字，也可能位于未解析资源或程序逻辑。

目前没有原版暗门概率、破墙次数、秘密房奖励和暗门触发条件的直接证据。原型若加入裂墙/暗门，应明确标注为复现补充设计，不引用本报告把它宣称为原版规则。

也尚未完成：全关卡配置覆盖、RoomSpring 精确积分器、MST 实际路径搜索及额外边抽样、地图种子协议、所有房间模板布局、所有可破坏物交互、不同角色对鸡肉和金币的完整修正。上述配置证据应与 `EXPLORATION_EVIDENCE.md` 和本轮原生分析证据配合使用。
