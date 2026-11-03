# 万能牌、获取途径与连击倍率：v10 原生证据

本次结论取自用户本地《Vampire Crawlers》发行包，不把反编译输出称为原项目源码。复用已有 Ghidra 数据库，用 `-readOnly -noanalysis` 定点读取；原游戏文件未修改。所有新反编译、汇编、配置、提取脚本和哈希记录在 `evidence/wild-acquisition-v10-native/`。

## 1. 更正 v9：拾取型万能牌并非永远不吃连击

`Card_E_CloverPetal` 资产确实设置 `ReceivesComboMultiplier=false`，但这不是最终运行时状态。`CardModel.RefreshReceivesComboMultiplier` (`0x18290d300`) 先调用 `ArcanaModel.TryApplyArcana_WildStrength` (`0x1828e8eb0`)；后者判断：

```text
PlayerModel.IsArcanaEquipped(_wildStrength) && cardConfig.isPickup
```

条件成立时，CardModel 的运行时 `ReceivesComboMultiplier` 强制为 true；否则才取 CardConfig 的序列化值。字段偏移由 IL2CPP metadata 与原 DLL 的 field-offset registration 双重解码：CardModel `+0xa1`、CardConfig `+0xdb`，`isPickup` 是 `+0xd8`，ArcanaModel `_wildStrength` 是 `+0x98`。`PlayerModel.IsArcanaEquipped` 地址为 `0x18294bf90`。

因此，v9 将资产 false 推导成任何状态都固定 +5 的说法不完整，现由本文取代。用户所述效果增长有明确原生机制支持；仅凭截图不能确定其存档是否装备此 Arcana。原型若按用户希望开局启用，必须标为原型开局配置，不能声称原版默认开启。

WildStrength 资源：`sharedassets0.assets:31642`，SHA-256 `e1c72c3e56073405f08a2149adfb816f054bf74953a3fe3753246a9c8a9061ee`。它的解锁成就 `MetricAchievement_WildStrength` (`sharedassets0.assets:31413`) 对应 `PickupCards_Played >= 200`；解锁与装备是两个条件。

### Luck 与 Draw 的完整数值链

`CardEffectsModel.OnPlayCard` (`0x182904c00`) 对配置主效果传入 `isInCombo && card.ReceivesComboMultiplier`；宝石追加效果不通过这一主效果倍率门。

* `LuckEffect.OnExecuted` (`0x182708780`，v9 证据) → `CardEffect.GetComboAmount` (`0x1826e3720`，最初 native 证据) → `Luck.AddValue`。非触发式主效果且有效连击时，基础值乘玩家连击倍率，再乘 CardCostType 的 amount multiplier。WildCostType 未覆盖该 amount multiplier，继承值为 1。
* `DrawEffect.OnExecuted` (`0x1826fea30`) → 继承的 `CardEffect.GetModifiedEffectAmount` (`0x1826e3e50`) → `GetComboAmount`；随后再加 `floor(snapshot.Magnet)`，进入 `Player.DrawCards` (`0x1829488b0`)。抽取请求仍受可用牌和手牌容量约束。StatSnapshot 是值类型，读取裸值时字段偏移比 boxed metadata 少 16 字节；`+0x2c` 对应 Magnet，并非 Greed。
* CloverPetal 的资产主效果依次为 Luck5、Draw1、Destroy。因此有效连击 3、Magnet0、装备 WildStrength 时：Luck +15，请求抽3；没有 WildStrength 时：Luck +5，请求抽1。
* LittleClover 的基础 Luck 为10，不是5；有效连击3时为+30。
* CoinEffect (`0x1826e5670`，协作 `effect-consumers-v10-native`) 先调用 GetComboAmount，再 AddCoins(useGreed=true)；GetGreedCoins (`0x182949b20`) 最终为 `ceil(comboAdjustedCoins * (1 + Greed / 100))`，不是银行家舍入。

Luck 的 `resetAfterEncounter=false`，会保留在当前 run；新局初始 Luck 从 PlayerConfig 的0及角色/成长修正计算，不能使用 PlayerModel prefab 初始化占位值100。Mana、Armor、Might、Amount、Area、Recovery、DealCount、Magnet、Scavenge 的 `resetAfterEncounter=true`；Health、Growth、Greed、Luck、Duration、复活/跳过/重掷等的对应标记为false。完整分组在 `WildV10.statResetAfterEncounter`。

## 2. 发行包内全部 15 种 WildCostType 配置

资产 ID 与对象名有两个历史别名：对象 `Card_M_0_RawMana` 的 AssetId 是 `Card_B_0_RawMana`；对象 `Card_W_Wings` 的 AssetId 是 `Card_M_0_Wings`。机器数据保留两者，避免遗漏。

| 原型 key | 本地中文名 | 原版卡牌类型 | 基础效果 | 默认接收连击倍率 | 获取证据 |
|---|---|---|---|---|---|
| bagOfCoins | 大钱袋 | Void | 金币25，销毁 | 否，WildStrength可开启 | 共享地图牌池 |
| largeBagOfCoins | 富豪钱袋 | Void | 金币50，销毁 | 同上 | 共享地图牌池 |
| coinPurse | 钱包 | Void | 金币10，抽1，销毁 | 同上 | 共享地图牌池 |
| cloverPetal | 四叶草花瓣 | Void | Luck5，抽1，销毁 | 同上 | 共享地图牌池 |
| littleClover | 三叶草 | Void | Luck10，销毁 | 同上 | 共享地图牌池 |
| orologion | 时祷怀表 | Void | 前排冻结，销毁 | 同上 | 共享地图牌池 |
| rosary | 玫瑰念珠 | Void | KillEffect，销毁 | 同上 | 共享地图牌池 |
| vacuum | 聚星宝珠 | Void | 抽1，销毁 | 同上 | 共享地图牌池 |
| littleHeart | 小红心 | Void | 治疗1，销毁 | 同上 | CelestialDusting 击杀行为生成 |
| coinCard | 金币 | Void | 金币1，销毁 | 同上 | FCC_BigTroubler 生成 |
| rawMana | 原始法力 | Mana | 法力3，销毁 | 否，且非pickup不受WildStrength开启 | SongOfMana/Mannajja 生成 |
| bracelet | 魔环 | Attack | 基础5发，每发20，RandomTargeting | 是 | 普通奖励池 |
| combo | 友情护符 | Special | 常规W续连击；可回手时另有条件效果 | 是，但不是所有效果乘倍率 | 普通奖励池；JestersHat列表 |
| wildDefence | 帕尔姆神盾 | Defense | 护甲1 | 是 | 普通奖励池；JestersHat列表 |
| wings | 翅膀 | Mana | 当前手牌下一次出牌减费1 | 是，但该效果本身固定1 | 普通奖励池；CappellaMagna特定牌池 |

`isPickup=true` 共10种；共享随机地图牌池是其中8种，小红心和金币卡不能因此混入该池。非拾取型共5种。W表示费用/连击类型，不决定牌面颜色：Void 的 typeColor 约为 `(0,0.22745,0.57647)`，底色约 `(0.88679,0.88679,0.88679)`；Special为黄色；Mana为紫红色；Attack为暗红；Defense为蓝色。各卡的真实 cardType、原始浮点颜色、背景色、宝石槽与标签排除均已输出到 `dist/wild-v10.js`。

## 3. 地图拾取确实进入 run 牌组，不在现场释放效果

完整调用链：

```text
DestructibleCard.OnSpawned 0x1828a0540
  → TryChooseRandomCard 0x1828a0a90（或 fallback）
  → SetCard 0x1828a0920（展示已选卡）
玩家碰撞/交互
  → OnDestructibleBumped 0x1828a0320
  → 首次 Wild 教程（如需要）/ TweenOut
  → OnTweenOutComplete 0x1828a06f0
  → Player.AddCardConfigToDeck(cardConfig, isTemporary=false) 0x182942980
  → AddCardConfigToCardPile 0x182942880
       使用 Deck.DrawPile
       GetOrCreateCard → SetConfig → pile.AddCard
       → OnCardAddedToPile 0x18294d790
  → 隐藏地图拾取物、记录其已破坏/拾取
```

该路径没有 CardEffect.Execute。探索画面中间出现卡面可用于展示拾取，不等同于当场获得 Luck/金币/冻结效果。卡片在后续战斗抽到并打出时才执行主效果。

销毁的作用域也不是仅本场：v9 已闭环 `DestroyEffect` → DestroyPile → ReturnCardToPool(remove=true) → RemoveCardFromDeck；因此该实例会从当前 run 牌组移除，不能在下场复活。它不会清除账号已解锁配置。

### 两个不同的共享池，不能混用

`DestructibleCardCanvas`，共享 bundle `CAB-ae4847204a3df06b8f66d553f79948c5:5333057170035836396`，SHA `31af329c187573487bec731caf62b77baef29411850398ac78a2ce236594326c`；另一个同类型实例 `8915561030030067441` 具有同一组权重。

| 卡片 | Canvas权重 | RT prefab权重 |
|---|---:|---:|
| BagOfCoins | 10 | 10 |
| CoinPurse | 5 | 5 |
| LargeBagOfCoins | 5 | 5 |
| CloverPetal | 5 | 5 |
| LittleClover | 30 | 5 |
| Orologion | 10 | 1 |
| Rosary | 5 | 1 |
| Vacuum | 5 | 3 |

RT 是独立 `DestructibleCardRT` prefab（`-5288815257257124740`）；不要把它的权重当成所有地图统一权重。原生 `TryChooseRandomCard` 使用 `Weighting` 做浮点加权抽取，`Chance` 是序列化展示值，不能按其四舍五入百分比抽取。抽取前过滤 `IgnoreUnlockCriteria || CardConfig.HasMetUnlockCriteria()`，没有符合项时用 fallback BagOfCoins。

特别注意反编译陷阱：`0x1828a0a90.c` 的泛型函数签名导致 Ghidra 将一段解锁检查误标为 unreachable；对应 `.asm` 在 `0x1828a0beb..0x1828a0c26` 清楚显示 IgnoreUnlockCriteria=false 时调用 `0x182961dc0`，成功才加入候选列表。此处以汇编为准。

已解析解锁例：CloverPetal要求 `CardGroup_LittleClover_Played >= 5`；CoinPurse要求 `CardGroup_BagOfCoins_Played >= 5`；Rosary要求 `PickupCards_Played >= 20`；Orologion要求30；Vacuum要求 `LightSource_Destroyed >= 30`。无用户运行时存档，不能假定所有候选已经解锁。

### 可破坏物的掉落链

共享 `DestructibleGargoyle` 的 `SpawnDestructibleOnDestroy` 组件：`CAB-ae484...:4708247377192846721`，其3项引用均在同一file中：

* `DropConfig_Coin:8433757290419265382`，weight60。
* `DropConfig_Card:-313020340016462665`，weight30。
* `DropConfig_Reroll:-4831866392748610388`，weight10。

这里第三项是重掷拾取物，不是鸡肉。`SpawnDrop` (`0x1828d9020`) 先过滤解锁、加权选 DropConfig，再按 DropTag 查询 PropDefinition、生成对应拾取物；`DropConfig_Card` 关联 CardDrop 标签。通用资产 `sharedassets0.assets:32264 Shared_CardDrop` 指向 Addressable GUID `87c3e6bce0e7dd54d95497cd75ed7d34`。GUID在原catalog.bin中存在；本次未完整反解catalog二进制条目，故不把“此GUID必选Canvas而非RT”的关联冒充已闭环证据。原型选用Canvas池应明确这一适配边界。

`ChooseWeightedRandomDrop` (`0x1828d8bd0`) 的整数实现使用 Random(0,total+1) 与 `roll <= cumulative`，第一项含零端点；权重60/30/10不应在文档无条件写成严格60%/30%/10%。未解锁Drop先移除也改变分母。

普通灯源由 `BaseLightSourceGenerationLayer` 的 `_randomTable` 决定，不能统一改成Gargoyle表。例如 Generic 层资产 `sharedassets0.assets:31155` 的表为 Card30、Coin30、Chicken20（cap1）、Reroll10；具体楼层配置可不同。地图配置中的数量/模板筛选也影响实际出现率。因此原型“每层放1张地面W和1个特殊破坏物”等数量属于原型配置，不是从本次证据提取的原版频率。

### 其他来源

* CappellaMagna 的 `DestructibleCardCM` 单项池为 `Card_M_0_Wings`，weight3；图书馆 `DestructibleCardIL` 则是 StoneMask，并非W随机池。
* CelestialDusting 的 `DamageExecutedBehaviour` 配置 `_littleHeartChance=5%`、`_luckChanceScaling=0.1`、`_addAsTemporaryCard=true`、`_littleHeartCard=Card_E_LittleHeart`；原生 OnEnemyDied `0x1826e43c0` → SpawnLittleHeart coroutine `0x1826f7300` 确实创建该卡。其触发还有战斗类型和玩家状态门，不能作为无条件每击5%。
* SongOfMana 的 CreateCardEffect 生成1张RawMana，Mannajja生成2张，`_addAsTemporaryCard=true`。`CreateCardEffect.OnExecuted` (`0x1826e65f0`) 按固定_numberToAdd循环；本身没有把数量乘连击。玩家回合走 AddCardConfigToHand，其他状态走 AddCardConfigToDeck。
* FCC_BigTroubler 的主效果 DiscardAndAddCardEffect，以及 OnDiscard→CreateCardEffect，引用CoinCard；后者数量1、`_addAsTemporaryCard=false`。

## 4. 特殊W效果不能全部按同一种倍率处理

**友情护符**：`ComboEffect.OnExecuted` (`0x1826fc570`) 只有 `CardGemsModel.CanReturnToHand` 成立时才直接令Combo+1。普通状态下，它的收益来自Wild常规续链/连击推进；不能额外无条件加一次Combo。

**翅膀**：`WingsEffect.OnExecuted` (`0x182719800`) 遍历当前手牌，使用固定 `_reduceAmount=1`，未调用GetComboAmount。`ReduceManaCostForOnePlay` (`0x18290cf50`) 只有 `_hasWingsEffect=false` 时才对 `_reducedManaCostModifier` 减1并置标记；在标记有效期间不会重复叠加。`ResetManaCostAfterOnePlay` (`0x18290d850`) 恢复modifier0及标记false。它是一次出牌的减费，既不同于永久免费宝石，也不同于无条件按连击减3。

`ResetManaCostsAfterEndTurn` (`0x18290db80`，原始native) 也清除该modifier，所以未打出的减费不保留到下回合。Wings资产 `_capCosts=false`，其执行代码没有最低0钳制；`GetCardCostTypeManaCost` (`0x18290c180/0x18290c1f0`) 把modifier传入原costType，保留原本支持负费的DefaultCostType语义。

**玫瑰念珠**：`KillEffect` targetingType0 → `GetFrontRowTargets` (`0x182705fc0`)；baseAmount1，ignoreAmount=true。有效连击时层数=`1×combo`，按施放时的当前最前层向后收集N层，不是全队所有深度，也不是对幸存前排Boss重复攻击N次。每个目标的伤害由 `GetDamageInfo` (`0x182704ce0`) 给出：

```text
armor + min(currentHealth, (1 - InstakillResist) * maxHealth)
```

再走正常 ResolveDamage。Ghost/Zombie/LionHead 的 InstakillResist=0；对应Elite分别约0.85/0.8/0.75。配置eraseItemThreshold1配合 `ShouldEraseItemsRoll` (`0x182708040`) 的 `threshold < random/LuckMultiplier`，正常非负Luck下不会清除物品掉落；不能让这种击杀丢失正常XP/掉落。

**时祷怀表**：DamageEffect基础amount1、damage0、freezeStacks1、FrontRowTargeting；ignoreAmount/ignoreArea=true，amountScalesWithCombo=true，freezeStacksScaleWithCombo=false。`FrontRowTargeting.ProcessColumns` (`0x182737620`) 每一轮遍历当前前排列，combo通过重复前排攻击轮数起作用；并非穿透后排。每击冻结值不直接乘combo，但可重复命中累积，仍受冻结抗性。Global `enemySettingsConfig.allowFreezeStacking=1`，`freezeDamageMultiplier=2`。

冻结移走当前intent并暂存，冻结敌人不会执行这一轮行动；协作调查补充 `EnemyModel.OnEndTurn 0x18292adc0`→`ResetFreeze 0x18292b640` 会在敌回合结束清除全部冻结层并恢复暂存intent。因此“冻3层=跳过3个回合”不成立。冻结层还可被该轮后续攻击消费。最终冻结概率、Duration增量、取整见协作效果文档与后续函数记录，模块保留原始flags防止过度简化。

`DecrementFreeze` (`0x18292a180`) 消耗至0且当前 `IsPlayerTurn=true` 时立即恢复cachedIntent，因此玩家后续攻击解冻后，敌人可能在紧接的敌回合重新行动。协作补取 `GetFreezeStacksPerHit 0x1826ed690`、`GetTotalFreezeStacks 0x1826ee4c0`、`GetNumberOfFreezeStacksSucceeded 0x18274dcc0` 已确认怀表每击基础1层、combo主要通过攻击轮数增加总尝试数，并对每层独立进行抗性概率判定。

## 5. 升级新牌的免费状态

额外核对用户此前观察：ChooseCardModal.CardChosen (`0x1829f9210`) 在玩家回合且手牌允许时，新牌直接进手，调用 `SetCardFreeToPlay` (`0x18290e080`) 写 `_isFreeToPlay=true`。`HandPileView.OnCardPlayed` (`0x182794170`) 首先调用 `ReturnFreeToPlayToDefault` (`0x18290dfa0`)，恢复配置FreeToPlay；即使该次牌返回手中也先清除这次免费。

这是支付免费一次，不改变原牌连击费用，不是 `_isTemporaryFree`。手满/非玩家回合的 `MoveChosenCardToDeck` (`0x1829fbd90`) 分支没有该赋值。未打出时跨回合/跨场的完整清理链尚未核尽，不能凭名称把它写成“统一回合末失效”。

## 6. 产物、验证与边界

* `wild-configs.json`：15种Wild原字段、9个可拾取牌prefab池、breakable/lightsource原表。64位Unity PathID按字符串输出，避免JavaScript精度损失。
* `dist/wild-v10.js`：CommonJS及global `WildV10`，规范key/中文名/真实cardType/颜色/简化effects/宝石槽/来源与待核项；它是数据模块，是否启用由engine选择。
* `configs.json`：主assets与全部biome资源包2790条配置，附对象SHA；3个AchievementDatabase容器因类型树泛型生成失败未解析，具体MetricAchievement及所列Wild/Card/Drop组件均解析成功。
* 原DLL SHA-256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`；metadata SHA：`319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。提取前后验证；每轮Ghidra日志有read-only discard。基础REA metadata evidence ID：`ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`。

这不是用户当前存档的运行时采集；账号解锁状态、装备Arcana、具体地图随机种子与最终Addressable实例选择仍不能由静态数据单独确定。已确认的条件规则与原型适配应分别展示。
