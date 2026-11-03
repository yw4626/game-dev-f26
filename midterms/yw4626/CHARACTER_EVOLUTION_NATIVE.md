# 角色卡、进化融合与自动结束回合：原版原生代码证据

日期：2026-10-29。适用本地已安装构建，不据此推断其他版本。本文只记录原版证据；原型的 Boss 后进化机会、可选角色范围和地图投放属于实现适配。

## 来源与复查

- `GameAssembly.dll`：88,280,576 bytes，SHA-256 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。
- `global-metadata.dat`：18,868,884 bytes，SHA-256 `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。
- REA 元数据证据 `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`。
- [本轮证据目录](evidence/characters-evolution-v8-native/) 保存目标地址列表、反编译 C、反汇编、字段偏移、脚本、日志和校验清单。复用既有 Ghidra 数据库，全部运行 `-readOnly -noanalysis`，没有重新全局分析或修改原游戏。
- 角色与配方序列化数值另见 `evidence/characters-v8-config/` 及 `evidence/levels-v7-config/configs.json`；数值由资源提取工作交叉核对，以下 native 地址负责解释执行路径。

## 角色与起始牌组

`PlayerRunSettings.GenerateDeck`（`0x1829c3c10`）在未指定覆盖牌组时，以第一个角色的 `deckConfig` 生成完整起始牌组；额外角色只追加其角色卡和主武器卡，而不是把各角色的整套起始牌组全部拼接。`AddFcc`（`0x1829c3150`）的可容纳角色数量来自进度配置；不能把原型提供两名角色理解为原版固定双人上限。

资源中两个适合首先复现的角色：

| 角色 | 起始牌组 | 角色差异 | 角色卡立即效果 | 后续响应 |
|---|---|---|---|---|
| Antonio | FCC_Antonio、Whip×2、Armor0、Spinach1 | 最大生命修正 +10 | 护甲 +3 | 攻击类型牌触发 Might +10 |
| Imelda | FCC_Imelda、Wand×2、Armor0、Attractorb | 基础法力修正 +1、Growth +20 | 经验 +15 | 特殊类型牌触发 Growth +1 |

两张角色卡均基础费用 0、基础持续次数 5。表中为配置基础值，立即效果仍需通过相应效果类的通用修正逻辑，不能把表中数值直接当最终所有情况下的结果。

## FCC 角色卡的生命周期

1. `FccConfig.OnPlayCard`（`0x182982ee0`）先调用普通 `CardConfig.OnPlayCard` 结算立即效果，再激活角色肖像并登记活动角色卡。
2. `FccPortraitModel.SetCard`（`0x182930a70`）用 `baseDuration` 初始化持续次数；`FccPortraitsModel.AddCard`（`0x1827f7fb0`）再加本次快照的 Duration 属性，并从玩家的 Duration 属性扣回该次附加值。没有发现基础持续次数乘当前 combo 的操作。
3. `CardTypeTrigger.CardMeetsConditionCount`（`0x182979000`）按所出牌类型列表中的匹配条目计数，通常一张匹配牌触发一次；它不按伤害命中段数计数。
4. `OnCardPlayed`（`0x1829300d0`）→`CheckTriggerConditionAndReaction`（`0x18292dd70`）→`TryTriggerFccReaction`（`0x182983630`）。后者先筛出可执行效果；无可执行效果时不消耗持续次数。成功响应先扣一次持续次数，再执行效果；最后一次扣到零的响应仍会执行。
5. 响应使用独立的效果调用，`Execute` 明确传入 `isTrigger=true`、`isInCombo=false`。`GetComboAmount`（`0x1826e3720`）只在 `isInCombo && !isTrigger` 时乘当前连击，所以响应不使用触发牌的当前连击倍率。因此 Antonio 的每次基础响应是 Might +10，Imelda 的每次基础响应是 Growth +1；通用宝石效果修正仍是另一条通路，不能据此断言所有带宝石的 FCC 永远固定数值。
6. 持续次数是响应次数，不是五个回合；不匹配类型的牌不会因此扣次数。`DecreaseDuration`（`0x18292ded0`）还存在疲劳模式的额外处理，普通模式无需套用疲劳分支。
7. `RemoveActiveFcc`（`0x1829516e0`）把正常到期、未破坏的角色卡送到弃牌堆；特定 OverTheTop Arcana 分支改送抽牌堆。不能在到期后永久删除这张角色卡，也不能直接每回合自动重新激活。

### 同一张牌内的先后顺序

原有 `reverse_engineering/vampire-crawlers/native/0x182955870.c` 的 `TryPlayCard` 显示：保存属性快照 → 扣费 → 执行所出牌的主效果/效果模型 → 通知活动 FCC `OnCardPlayed` → 后处理。FCC 响应发生在触发牌主效果之后。

因此 Antonio 的此次 Might 响应增强后续攻击，不能倒加到刚刚触发它的攻击伤害上。Imelda 的 Growth 响应同样不应追溯改变该特殊牌已经发放的经验。角色卡立即效果和活动响应是两条不同路径，不能共用一个时点。

`ExperienceEffect.OnExecuted`（`0x182700030`）先调用通用效果数值修正，再调用 `Player.AddGrowthXp`（`0x182943420`，见 `evidence/levels-v7-native/`）。因此未加特殊宝石的 Imelda 角色卡自身经验为 `ceil(15 × 本次连击倍率 × (1 + 当前Growth/100))`；不能只实现 `15 × combo`。例如基础 Growth +20、连击倍率 1 时是 18 经验。

## 当前进化路径：消耗配方材料，生成新卡

**完整 `InsertGemModal` 进化流程会消耗选中的主武器和辅助材料，生成一个新的进化卡实例。** 单独阅读底层 `EvolveGemEffect.OnGemAddedToCard` 只能看到配置替换，不足以判断完整 UI 流程是否消耗材料。

### 地图入口

地图的 `Shared_DestructibleEvoStatue` 绑定 `DestructibleEvo`。`OnDestructibleBumped`（`0x1828cde50`）进入延迟协程（`0x1828e2c30`），恢复已保存的宝石选择流程，或调用 `GemInsertionSequence.OnGemEventFound`（`0x182722130`）启动新的进化宝石流程。

完成回调（`0x1828ce0c0`）消耗并播放雕像完成动画；离开回调（`0x1828ce1f0`）保存宝石流程数据并解除交互锁，保留未完成的雕像。已确认雕像入口，**尚未确认每个 Boss 或每层结束都必定自动生成一次进化机会**。

### 配方和筛选条件

- `DoesPlayerMeetEvoRequirementsForTarget`（`0x1829486c0`）要求目标进化卡已解锁，且每个 `_evolutionComponents` 引用的 CardGroup 都有持有计数。这里配方引用是卡牌组，不是某一固定等级的具体 CardConfig。
- `DoesPlayerHaveCardWithEmptySlotsForEvo`（`0x182948250`）检查对应主武器组中的实际卡牌存在空宝石槽。
- `PopulateValidEvoChoices`（`0x182a31b50`）分武器组和辅助组两个阶段，排除已经选中的实例。第一张主武器要满足空槽、独有宝石与宝石标签等条件；后续辅助材料不必有空槽。
- `RefreshGroupsStillRequiredForEvo`（`0x182a32160`）按每张已选材料移除一个所需 CardGroup 条目。因此应按配方组和实例数量匹配，不能用“持有任意同名卡”替代多重材料检查。
- 当前进化宝石选择路径没有发现“材料必须升级到最大卡牌等级”的要求。另一个旧式 `EvoTable` 路径含最大等级与升级逻辑，不能把它直接拼到当前雕像/宝石流程上。

已提取的典型配方：MagicWand + EmptyTome → HolyWand；FireWand + Spinach → HellFire；Knife + Bracer → ThousandEdge。资源还存在 Runetracer + Armor → NoFuture。具体基础数值和成品多段攻击等由相应卡牌配置负责。

### 选择、继承、消耗的闭环证据

`OnCardPickedEvoTask`（`0x182a42a10`）记录第一张主武器、追加每张选择的材料实例，刷新还需的组；材料齐备后进入 `DestroySelectedEvoCandidatesAndRewardEvo`。

`AnimateGemHammerForEvoInsertion`（`0x182a3ce90`）执行：

1. 将展示用临时卡切换为目标进化配置。
2. `CopyGems`（`0x1829063e0`，本轮复用 `evidence/gems-v6-native/0x1829063e0.c`）从第一张主武器复制槽数和现有宝石。
3. `TryAddGemToEmptySlot` 把进化宝石镶入剩余空槽。
4. 通过 `Player.GetCardModel` 创建实际的新进化卡；记录原来的基础配置，并再次把展示卡上的宝石复制到实际新卡。
5. 新卡局外进入抽牌堆，战斗内进入手牌。该分支直接检查 `PlayerModel._isInEncounter`（`+0x24e`），默认 `_drawPile`（`+0xa8`），战斗中改为 `_handPile`（`+0xb0`）。

`DestroySelectedEvoCandidatesAndRewardEvo`（`0x182a3f8a0`）等待上述动画/新卡生成完成后，遍历 `_cardsSelectedForEvo` 中**全部**原材料，依次从所在牌堆移除、从牌组移除、归还对象池；其中包含第一张主武器。

由此得到可直接实现的规则：

- 新成品使用新实例 ID；配方所选全部原实例被消耗。
- 保留第一张主武器的宝石槽数和原有宝石，再增加一颗进化宝石。
- **进化宝石保留并占一个槽位**，不是执行后自动消失的指令。
- 辅助材料上的宝石没有被复制到新卡；随辅助卡消费而不再保留。
- 因为进化宝石需要落入主武器的空槽，所以无空槽的武器不能直接走此流程。

字段定位见 `field-offsets.json`：`InsertGemModal._cardsSelectedForEvo +0x190`、第一张主武器 `+0x1a0`、演示卡 `+0x1a8`、目标配置 `+0x168`。`GemSlot.SetGem`（`0x182933c90`）保存宝石配置；复制进化宝石时采用其禁用复制触发的语义，避免再次递归进化。

## 自动结束玩家回合

`AutoEndTurnCheck`（`0x182943e50`）先检查自动结束设置、玩家回合、战斗中、UI/交互锁与正在执行的流程。`AreAnyCardsInHandPlayable`（`0x182943bd0`）遍历手牌，用实际修正后的 `GetCardCostTypeManaCost(false,false)` 与当前 Mana 比较；并非简单判断 Mana 是否为零。

因此零费牌和免费宝石牌仍可打出时，不能自动结束。`CouldPlayerPlayMoreCardsAfterPlayingCard`（`0x1829470c0`）还用于避免在当前牌可能产生额外出牌机会时提前结束。

`DelayedEndTurn`（`0x18296f970`）经过短延迟后再次调用 `CanPlayerKeepPlaying`（`0x182945270`），确认仍无法继续才 `OnEndTurn`。原型应在抽牌、回蓝、角色响应、升级选择和动画队列完成后检查，并在实际结束前再次检查，防止竞态导致错过新抽到的牌。

## 证据边界

本轮为静态原生代码与序列化配置的交叉验证，没有新增实机采集。已闭环证明基本角色持续次数、响应顺序、完整进化材料消费与宝石继承、自动结束检查条件。尚未证明进化雕像在所有地图/楼层的具体投放率、每次 Boss 后固定出现的规则、全部 Arcana/疲劳模式交互；这些不能标成已经复现的原版规则。
