# v0.7 原版经验、角色等级与选牌证据

本次复用已有 Ghidra 数据库，以 `-readOnly -noanalysis` 提取；未运行或修改游戏。反编译及汇编位于 `evidence/levels-v7-native/`，配置另见 `evidence/levels-v7-config/`。这是静态证据，不代表逐帧运行采集。

## 可以用于原型的规则

1. **杀死敌人时获得经验，不是每场结束固定选一张卡。** `EnemyModel.ResolveDamage` (`0x18292b930`) 检测血量从存活跨入死亡，读取 EnemyConfig 的 XP，加上伤害调用传入的额外 XP，在未禁用 XP 的分支调用 `PlayerModel.AddEnemyXp` (`0x1829431f0`)。同一个已死亡目标再受伤不会重复跨越该边界。返回经验数交给 `EnemyView.SetDeathXpSettings`，用于死亡经验表现。
2. **敌人经验计算：** `ceil((baseXp + extraXp) × (1 + Growth/100) × (1 + Curse/100))`。`CalculateEnemyXp` (`0x182944a70`) 同式；`CalculateGrowthXp` (`0x182944be0`) 只有 Growth 项。字段表确定 PlayerStats `+0x40=Growth`、`+0xa8=Curse`；二进制常量确认为 100、1。`0x1805a8a10` 的 `roundsd …,10` 与兼容实现均证明向上取整，不是四舍五入。
3. **角色等级从 1 开始，XP 从 0 开始。** `InitXP` (`0x18294bde0`) 设置等级 1、当前/累计经验 0、阈值 `GetLevelUpXp(1)`。`AddXp` (`0x182943830`) 累加当前及累计经验，使用 while 消耗当前等级阈值并升级，保留余数，允许一次经验跨多个等级。这是当前 run 的玩家等级，不是给每张牌加一档伤害。
4. **升级触发选牌，可以发生在战斗中。** XP 模型即时更新；视觉 XP 由 PlayerView/PlayerXpBarView 单独推进。`DoViewLevelUp` (`0x18283d120`) 检查非 GameOver 后打开 ChooseCardModal，并注册 GameView 更新与 TimeManager 请求。`ContinueXpFillAfterLevelUp` (`0x18283cba0`) 逐级推进视觉等级，关闭后继续剩余经验显示。没有“必须所有敌人死亡”的门槛。精确暂停到哪一个动画帧仍未运行采集；原型可以在当前出牌动作结算完成后弹窗，不能把它表述为逐帧复刻。
5. **选择的卡真的加入当前牌组。** `CardChosen` (`0x1829f9210`) 在 `_isPlayerTurn` 为 true 且 `CanAddCardToHandPile(false)` 允许时，创建新 CardModel（构造等级参数 1），登记 DiscoverCard，再 `TryAddCardToHand`；否则走 `MoveChosenCardToDeck` (`0x1829fbd90`)，创建新卡并加入 **DrawPile**。因此新卡在玩家回合有空位时可直接进手；手满/非玩家回合进抽牌堆，不能默认进入弃牌堆。DiscoverCard 另有发现记录用途，但这不替代本局获得卡牌。
6. **普通角色升级默认展示 3 项。** `PopulateCardRewardChoices` (`0x1829fcfb0`) 以 `3 + booleanBonus` 调用 PopulateRewards；可用规则/幸运分支添加第 4 项。第 4 项另有奖励池逻辑，不能假设永远是第 4 张普通卡。池还受角色/等级的 ManaDistribution、卡牌可用性、数量上限、重抽等过滤，原型均匀三选一属于简化。
7. **不要根据残留方法名实现普通卡牌升级。** 当前文件中 `PlayerModel.TryLevelUpCard` 的方法地址 `0x1805f2a40` 只有 `xor al,al; ret`，恒返回 false。`ChooseCardModal.LevelUpCard` (`0x1829fbd50`) 调用的正是这个方法。元数据保留升级奖励/概率/等级字段，不等于功能有效。当前原型的通用“花金币给任何牌加伤害”及“每场必选卡”没有这条证据支持，应撤去或明确标作旧版演示规则。

**与宝石强化区分：** 此结论不取消已验证的 UpgradeGemEffect、伤害宝石或槽位系统。宝石驱动的效果档位在 `GEM_NATIVE_EVIDENCE.md` 已有独立执行链；不能据普通 TryLevelUpCard 为空就说原版完全没有强化。

## XP 阈值，不是直接套平方公式

`PlayerLevelConfig.GetLevelRangeXp` (`0x18298c320`)：设 `n = level - 1`，从 `_baseXpReq` 开始，依次加 `clamp(n - range.start, 0, range.end - range.start) × range.xpReq`。到尚未开始的 range 即返回。

配置 `_baseXpReq=5`，range 每 5 级一段，每段增量依次 10、12、14、16、18、20、22、24、26、28。

| 当前等级 | 升下一级需要 XP |
|---|---:|
| 1 | 5 |
| 2 | 15 |
| 3 | 25 |
| 4 | 35 |
| 5 | 45 |
| 6 | 55 |
| 7 | 67 |
| 8 | 79 |
| 9 | 91 |
| 10 | 103 |
| 11 | 115 |

`GetLevelUpXp` (`0x18298c490`) 对 level<1 返回0。只在 level>最后 range.end 时进入额外曲线：设 `t=level-lastEnd-1`，在分段结果上加 `lastRange.xpReq × t + pow(t, xpCurveExponent) × xpCurveMultiplier`，浮点结果截断成整数。本配置 lastEnd=50、exponent=2、multiplier=5；因此 1—50 级不能使用 `5×level²` 替代。

## 证据范围和复现边界

- 本次原生文件哈希：GameAssembly.dll `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`；global-metadata.dat `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。
- REA 元数据证据 `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`；`field-offsets.json` 重新核对这两个文件的身份。原始直接调用扫描 `callscan.json` 只是定位工具，结论同时由目标反编译与汇编验证。
- 敌人具体 XP 来自独立资源提取，例如 Ghost=3、Zombie=4、LionHead=4。必须按实际敌人 config 对应，不能把敌人费用/强度作为 XP。
- 本次未完整复刻角色/等级奖励池权重、教程奖励、额外第4项、所有特殊 XP 禁用/额外奖励来源、视觉经验粒子时序；须作为已知简化保留。普通战后宝箱等独立奖励来源不因本结论自动被否定。
- 另顺带导出 GainManaEffect.GetModifiedEffectAmount (`0x1827008a0`)：非连击最终返回基础 `_gainAmount`；连击时走修改效果链，特殊 flag 可选 alternate amount。用于核对新增法力支援牌，不能解释为地图上增加 StartingMana 的拾取物。
