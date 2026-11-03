# 地图拾取物与本局成长：原生证据 v7

## 结论

原版确实有提高“每回合法力”的地图法力拾取物，以及提高“每回合发牌数”的护腕拾取物。它们应和即时回蓝卡、即时抽牌卡、手牌容量、元进度永久升级分开建模。

本轮为只读静态逆向，未启动或注入游戏。继续使用已保存的 Ghidra 工程，`-readOnly -noanalysis`，没有冷导入或保存工程变更。下列地址对应当前 GameAssembly.dll 的虚拟地址；原始 `.c/.asm`、字段偏移、脚本和散列索引在 `evidence/pickups-v7-native/`。

源身份：

- GameAssembly.dll SHA256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。
- global-metadata.dat SHA256：`319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。
- 沿用初始 REA 元数据证据 `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`；字段检查脚本重读原始文件验证散列。
- 精确资源配置和对象身份见 `evidence/pickups-v7-config/configs.json`。本轮资源协作已确认 PlayerModel `level3:24810`，对象 SHA256 `39ebc29b2d5d78da59a117465f4189e237d198e9caedec65a7faa6a11ff5cfd7`。

## 法力拾取物

### 执行链

`DestructibleMana.OnDestructibleBumped` **0x1828d1420** 先检查对象未销毁且不在交互中，启动 `OnDestructTask` 并锁定交互。

实际协程 `<OnDestructTask>d__15.MoveNext` **0x1828ddde0** 在拾取动画后调用：

```text
player.PlayerStats.IncreaseMana(this._amountToGive, increaseStarting = true)
```

随后隐藏对象、标记销毁、解除交互锁、记录统计。`_amountToGive` 位于 DestructibleMana +0x68。资源中两个 DestructibleMana 实例均为 **1**。

`PlayerStats.IncreaseMana` **0x18273d570**：

```text
Mana.AddValue(amount)                         // 当前法力，受 SimpleStat 边界约束
if increaseStarting:
    StartingManaIncreased(amount)
    StartingMana += amount                    // 独立的每回合基础法力变量
```

因此提示应为“每回合法力 +1，当前法力 +1”，不能只写“恢复1法力”。这条路径**没有修改 PlayerConfig.maxMana**。资源中 maxMana=1,000,000 是配置硬上限；baseMana=2 是基础起始值，二者不是同一个概念。

### 持续时间与重置

- 原有 E37 `ResetManaOnStartTurn` 使用 StartingMana 刷新每回合法力，并按 PlayerConfig.maxMana 限幅，拾取收益持续到之后的回合。
- 既有 `PlayerStats.OnEncounterDefeated` **0x182740710** 重置可重置的 SimpleStat 当前值，不重置独立 StartingMana。因此收益跨遭遇保留；战后当前法力是否暂时被设回某值，与下一回合的法力供给不是同一层。
- `PlayerStats.Save` **0x182742440** 保存快照与各属性运行内修正；`Load` **0x18273e070** 明确将保存快照中的 StartingMana 写回 PlayerStats +0x10，同时恢复 Mana 当前值。不是只在一个战斗对象内的短期变量。
- `PlayerStats.ResetValues` **0x182741470**（复用 v6 提取）会按初始配置/角色/进度重新初始化；本轮没有证据将地图拾取视为永久账号元进度。原型应在本局状态保存，开始全新一局重置。

另一个方法 `PlayerModel.AddStartingMana` **0x182943610** 也同时增加起始与当前法力，但**不是这里拾取协程的直接调用目标**，不能因名称相近把两条调用链混写。

## 护腕与其他属性拾取物

### 执行链与准确枚举

`DestructibleStatItem.OnDestructibleBumped` **0x1828d39d0** 同样检查/设置交互锁。实际 `<OnDestructTask>d__13.MoveNext` **0x1828dd870**：

```text
stat = player.PlayerStats.GetStat(this._statToIncrease)
stat.AddRunValueModifier(float(this._amountToGive), notify = true)
hide object; mark destroyed
```

汇编 **0x1828dd9ca–0x1828dd9db** 明确从对象+0x64取整数、转float，并以notify=true调用 **0x182745820**，弥补反编译漏显示浮点参数的问题。

`PlayerStats.GetStat` **0x18273d390** 的 switch 与字段表对应如下。反编译末尾的异常/跳转表附近有坏指令警告；这里的有效case映射同时由汇编和 PlayerStats 字段偏移核对，不使用其异常尾部推导行为。

| 资源stat枚举 | 实际属性 | PlayerStats偏移 | 本轮资源物体/数值 |
|---|---|---|---|
| 10 | DealCount，每回合发牌数 | +0x68 | DestructibleBracer：+1 |
| 15 | Rerolls，重掷次数 | +0x98 | DestructibleReroll：+1 |
| 0 | Area，范围 | +0x38 | 对应属性拾取：+10 |
| 4 | Might，威力 | +0x28 | 对应属性拾取：+20 |
| 1 | Amount，数量 | +0x30 | 对应属性拾取：+1 |

资源最终名称/生成引用链以配置证据为准。不是所有可破坏物都掉这些奖励，也不能据此猜测每个房间都有一个。

### AddRunValueModifier 不等同 AddValue

`SimpleStat.AddRunValueModifier` **0x182745820** 读取实例 `_statModifierType`（+0x58），再选择策略；显式类型重载 **0x1827456a0** 具有相同分支。

| modtype | 原生处理 |
|---|---|
| 0 | 在最大值剩余空间内提高最低值与当前值，并累积运行内基础修正；修正受max/min边界限制 |
| 1 | `AddRunBaseModifierValue` **0x182745600**，修改运行内基础修正，不走同一个直接加当前值分支 |
| 2 | `AddValue`，只加当前值 |

真实 PlayerModel 配置已确认 DealCount/Might/Amount/Area 的 `_statModifierType=0`、`_resetAfterEncounter=true`；Mana也是0/true，Armor是1/true。

因此护腕地图拾取不仅提高当前DealCount，还保存运行内基础修正。`GetStartingDealCount` **0x18273c030** 计算“配置baseDealCount + 角色加成 + 元进度加成 + DealCount运行内基础修正”；`OnEncounterDefeated` 重设时使用这个已增强的基础值，**跨战斗保留地图护腕收益**。原型应把它放在run状态，不在进入每场战斗时恢复固定抽牌数。

原版 `AddRunValueModifier` 是有上下界的属性运算；达到模式或属性上限后不能继续无界增加。其临界饱和分支涉及min/current/runBaseModifier之间的先后更新；没有实测大量拾取抵达上限的过程，原型采用安全限幅时应标为简化。

## 每回合发牌、立即抽牌与手牌容量

这三个概念需要分别显示：

1. **DealCount.current**：回合开始请求发多少张。原有 E36确认是额外发这个数量，并非补齐到这个数量；保留牌仍占手牌空间。
2. **DrawEffect**：当前时点提出抽牌请求。地图护腕协程没有调用DrawEffect，也没有直接往手牌加一张。
3. **DealCount.max**：在有限手牌模式下参与容量计算；普通非初始抽牌还加 HandSizeDrawOffset。拾取物modtype0并不直接增加该max，所以“发牌+1”不能自动写成“手牌容量+1”。原有 RULES E29详述当前出牌预释放一个手牌位置的分支。

资源 PlayerConfig.baseDealCount=3；有限模式中的手牌限制4/7来自独立模式配置。不要把这些合成一个永久固定handLimit，也不要把地图护腕的收益藏在一次Draw动画里。

`DealCountEffect.OnExecuted` **0x1826fd1b0**（例如卡牌护腕）通常直接 `DealCount.AddValue`，另有按模式调整max的分支；它与地图护腕调用 `AddRunValueModifier` **不是同一持久性路径**。`DealCountEffect.IsEffectBlocked` **0x1826fd090** 还有限制判断。原型若两者都支持，需要区分“本次战斗中增加”和“本局成长”，不要因图案/名称相同共享一段无差别代码。

额外容量核对：`SimpleStat.get_Max` **0x1805f9120** 直接返回+0x20，`GetMaxValue` **0x182745bb0** 返回这个变量的值或uncapped常量，二者均不把runBaseModifier加到max；共享getter可能以其他元数据候选命名，汇编是相同的 `mov rax,[rcx+0x20];ret`。`TryGetCurrentMaxHandSize` **0x1829556f0** 直接读取该max。`DealCountNumUpdated` **0x1829473b0** 只更新指标；`CheckAreStatsDirty` **0x182945370** 调用ResetAllCardEffects，没有在此直接改DealCount.max。卡牌DealCountEffect才显式把有限模式max设置为 `min(currentMax + effectAmount, MaxHandSizeLimit)`；战后PlayerStats路径把有限模式max重设为BaseHandSizeLimit。以上不能简化为“地图护腕runBaseModifier自动增加handLimit”。

地图阶段：`SpawnDestructibleOnDestroy.Awake` **0x1828d8b40** 登记破坏回调；`SpawnDrop` **0x1828d9020** 筛选并抽取掉落配置，再生成奖励对象。配置工作确认Cart_AlwaysMana的掉落表仅Mana、普通Cart仅Bracer（权重1）。这与专用Mana/Bracer本身的收集协程是两个阶段。独立摆放orb/护腕时可直接收集；若原型表现为推车，应先破坏并显示奖励，再通过奖励对象的收集交互加属性。

## 对 v6 宝石持续时间的补充

本轮真实PlayerModel配置补齐了上轮缺少的 `_resetAfterEncounter`：Might和Amount均为true。此前确认的非永久 MightEffect/AmountEffect 走AddValue，默认decay为0，因此通常在本次战斗中持续，胜利结算后回到包含已有run基础修正的基础值。地图对应StatItem走AddRunValueModifier，新增run基础修正会保留。这个区别有资源和原生双重依据。

## 实现与证据边界

- 可直接实现：法力拾取amount1→当前mana+1、run每回合法力+1；地图护腕amount1→run每回合发牌+1；奖励物被收取后不可重复获得；楼层/战斗切换保留本局增长。
- 建议UI明确标“本局成长”“每回合法力”“每回合发牌”，手牌容量另外显示；普通回蓝/抽牌卡沿用即时效果说明。
- 本轮没有逆向全部掉落概率、各房间精确摆放数、所有特殊模式对法力/DealCount的变更，亦未验证达到极限时的原版画面表现。地图新增成长物数量与权重如果由原型自行选择，应作为布局/平衡适配记录。
- `DestructibleEffects` 的名字不等于直接StatEffect：它协调破坏阶段、动画和后继对象；奖励数值应由其引用的具体DestructibleMana/StatItem配置及上述执行链决定。
