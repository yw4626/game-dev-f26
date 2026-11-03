# 宝石、卡牌强化与连击：原生证据（v6）

本记录是静态逆向结果，不代表本轮已进行原版运行时采样。资源数值另见 `evidence/gems-cards-v6-config/configs.json`。实现时应将以下已确认语义与原型自己的取得概率、选项数量、商店价格区分。

## 来源与复现

- 原版 `GameAssembly.dll`，88,280,576 bytes，SHA256 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。
- 原版 `global-metadata.dat`，18,868,884 bytes，SHA256 `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。
- 沿用 REA 初始元数据证据 `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`；`inspect-fields.cjs` 重读原文件并验证上述散列，利用 IL2CPP 注册表恢复字段偏移。
- 使用已保存的 `VampireCrawlersRules` Ghidra 工程，`-readOnly -noanalysis`，定点提取。没有修改游戏或保存工程变化。脚本、分批目标、日志、反编译和汇编均位于 `evidence/gems-v6-native/`；`manifest.json` 为本轮证据文件散列索引。
- 部分短函数的反编译器把尾调用展开到其他函数；确认这些函数时优先阅读同地址 `.asm`，不要把展开后的长 C 文本误判为该函数独有逻辑。

## 取得、取消和镶嵌流程

1. 碰到宝石箱时设交互锁，订阅完成/取消事件，然后开始宝石选择流程：`DestructibleGemChest.OnDestructibleBumped` **0x1828cea00**、`GemChestView.StartSequence` **0x18275a8b0**。
2. `ChooseGemModal.GetGemChoices` **0x182a03f80** 使用配置选项数和 Luck 额外选项分支，建立可用宝石池并按频率选择。`TryChooseGem` **0x182a080c0** 在选中频率的有效候选中累加各 `GemConfig.Weighting`，按累计权重抽取。不能把所有宝石设等概率，并声称这是原版概率。
3. 选宝石后再选可镶嵌卡牌；普通镶嵌动画最终对实际卡牌调用 `CardModel.TryAddGemToEmptySlot`，随后更新展示副本：**0x182a3e240**。这不是对同名所有牌一起强化。
4. 成功完成时宝箱退订事件、隐藏对象并发出移除通知：`GemInsertionCompleted` **0x1828ce810**。
5. 取消时仅清除交互锁和退订事件，未销毁/隐藏箱子：`GemInsertionQuit` **0x1828ce870**。`GemChestView.OnGemInsertionQuit` **0x18275a4b0** 还保存当前插入序列状态。原型可以取消并保留宝箱；建议保留已抽取选项，避免反复打开免费重抽。尚未逐字段验证取消状态中保存的所有候选及 RNG 状态。
6. `InsertGemModal.ReturnToGemChoices` **0x182a327d0** 支持从卡牌选择返回宝石选择，正在插入时禁止返回。

`ChooseGemModal` 构造函数 **0x182a08ed0** 明确把+0x17c初始化为 **3**；`InitGemChoiceSettings` **0x182a052f0** 又能用调用参数覆盖。资源中的 gemChoiceModalConfig.MaxChoices=5、LuckChanceModifier≈0.1。完整原版存在频率回退、进化项、封印/排除和 Luck 特例；本轮没有把这些所有分支恢复成原型规则。固定“三选一”可以沿用原版默认，但不能标作所有宝箱的原版硬规则。

## 槽位、相容性与保存

| 规则 | 证据 |
|---|---|
| 初始槽数取 `CardConfig.GemSlotCount`（+0xf0）；已有永久进度时取该 cardConfig 的保存槽数 | `CardGemsModel.Init` **0x182909080** |
| 进化卡有 baseCardConfig 时沿用基础卡配置；临时牌或 `IsCopyWithDestroy` 牌初始化为0槽 | 同上；`PlayerModel.IsCardTemporary` **0x18294c310** |
| 永久槽位升级按 cardConfig 保存，以 `MaxGemSlotsAllowed`（+0xec）为上限，扣除槽位升级成本后槽数+1 | `ProgressionData.CanUpgradeCardGemSlots` **0x1829c6d40**、`AddCardGemSlot` **0x1829c6890** |
| 槽数增加时创建/启用槽；减少时关闭多余槽并撤销其中宝石效果 | `AdjustGemSlotCount` **0x182906210**、`RefreshGemSlots` **0x182909e50** |
| 普通选择卡牌必须至少有1空槽；`IsUnique` 宝石不能在同一张卡重复；宝石标签与卡允许标签有任意一个交集即通过标签检查 | `IsCardValidChoiceForGem` **0x182a2fce0**、`DoesCardHaveMatchingTag` **0x182984c00** |
| 允许标签先从全标签库取出，删卡配置排除标签/排除组，再按所有已装宝石做动态排除，最后按所有已装宝石做动态包含 | `CardModel.GetAllowedGemTags` **0x18290b9f0** |
| `TrySetGem` 仅在槽为空时成功；直接 `SetGem/ReplaceGem` 会先撤销旧效果再施加新效果 | **0x182933ef0**、**0x182933c90**、**0x182933b20** |
| `RemoveGem` 撤销效果并清除槽显示，没有退款或退还库存逻辑 | **0x1829339f0** |
| 加载卡牌时读取保存槽数，逐个通过宝石ID查库并重新装入，恢复效果 | `CardGemsModel.Load` **0x182909300** |

因此：**槽位解锁是按卡种保存的元进度，镶嵌宝石是具体 CardModel 实例状态**。不能把某张鞭子的宝石直接复制给所有鞭子。已确认底层替换能力，但普通获取UI只筛空槽卡；没有证据证明原版支持随时免费拆卸/替换。若原型提供此功能，应明确为原型便利设计。

`CardBlacksmith.OnCardPicked` **0x1829bbb90** 检查元进度货币是否足够 `GetCardGemSlotCost`，然后走打铁动画。原版有 GemHammer 遗物数据库项，但本轮未证明它是地牢中消耗一次给卡加槽的拾取物。原型若在地图上放“锤子→选卡加槽”，应标为借用原版槽数/上限规则的适配流程。

## 费用与伤害宝石

### ManaGemEffect

`OnGemAddedToCard` **0x182989f70** 把配置 `_manaChange` 写入卡牌宝石修正表。`AddGemManaModifier` **0x182906030** 以 GemConfig 为键保存 `(count, modifier)`；`GetTotalManaModifier` **0x182908d90** 返回 `sum(count * modifier)`，空表为0。

已有 `RULES.md` 的 E07/E12 确认该有符号总值同时加到实际支付费用和连击费用。减费宝石不是“免费”标记：它会改变下一张接连击所需费用。这里没有把负费用强行归零；原型若限制最低费用0，应说明为设计简化。

### FreeToPlayGemEffect

`OnGemAddedToCard` **0x182984290** 调用 `RegisterFreeToPlayGem` 并更新卡面。已有 E07/E12 确认免费标志使正常支付费用提前返回0，但 `GetCardComboCost` 没有该提前分支，所以**免费牌仍保留原有连击费用**。UI应分开显示“支付0”和“连击费用N”。

### DamageMultiplierGemEffect

`OnGemAddedToCard` **0x182979b40** → `AddGemDamageMultiplier` **0x182905f50**；表按 GemConfig 存 `(count, multiplier)`。

`GetGemDamageMultiplier` **0x182907060**：

```text
G = 1                              // 没有伤害倍率宝石时
G = sum(count_i * multiplier_i)     // 至少有一项时
```

已从 PE 字节确认空表常量 **0x183cbdb9c = float 1.0**。例如单2倍=2、两枚2倍=4、2倍+3倍=5；不是逐项相乘，也不是 `1 + sum(...)`。是否可叠同款仍由 IsUnique/标签/槽位决定。

G位于既有基类伤害公式内部：`RoundToEven(B * (M + L) * G * K * (C + A))`，在最后取整之前；LimitBreak平坦伤害在这次取整之后加。详见既有 `RULES.md` E16–E20。不要先取整伤害再乘G。

## 强化等级、附加效果与反向连击

### UpgradeGemEffect

`OnGemAddedToCard` **0x1829909f0** 调用 `IncrementUpgradeGemCount` 后更新卡面。既有 E44 `DamageEffect.GetLevelConfig` **0x1826eb700 / 0x1826eb810** 选择 `clamp(GetUpgradeGemCount(), 0, configs.count-1)`。卡牌伤害配置档位与已装升级宝石计数关联，不能用玩家等级无条件代替。不同效果有自己的等级配置数组，不能只把伤害统一乘百分比。

### CardEffectGemEffect

`OnGemAddedToCard` **0x182977350** 的触发枚举映射：0=出牌、1=抽到、2=丢弃、3=连击、4=回合结束、5=击杀。

trigger0 调用 `CardEffectsModel.AddOnPlayCardEffect` **0x182901240**，追加到现有出牌效果列表尾部。`CardEffectsModel.OnPlayCard` **0x182904c00** 按列表顺序执行，并且只有索引小于原卡 `CardConfig.onPlayEffect` 长度的效果能开启卡牌连击倍率。**附加的宝石出牌效果不继承连击倍率。**

因此对应资源里的 Draw1、Armor2、Might10、Amount1，普通情况下应先处理原卡效果，再处理宝石附加效果，附加值不乘连击。不能让后置 Might/Amount 反过来改变同次出牌已经生成的主伤害。主出牌流程还在扣费前保存属性快照（原E02）；不要在每个附加效果前都重新读取全部实时属性冒充原版。

Might/Amount 生命周期：`MightEffect.OnExecuted` **0x18270bf80**、`AmountEffect.OnExecuted` **0x1826e0ab0** 检查 `_isPermanentGain`；false 时 `SimpleStat.AddValue`，true 时 `AddRunValueModifier`。既有 E36 每次回合开始减 PlayerConfig 的 decay，已提取的默认 `mightDecay=0`、`amountDecay=0`，因此默认没有逐回合衰减。`PlayerStats.OnEncounterDefeated` **0x182740710** 对 `_resetAfterEncounter` 为true的 SimpleStat 将当前值重设为对应基础值；`PlayerStats.ResetValues` **0x182741470** 初始化时也重设。**本轮尚未拿到原版实际 Might/Amount SimpleStat 实例的 resetAfterEncounter 配置旗标，故“默认整场战斗有效、战后清除”仍需这个实例配置或运行时核对**。不应默认为一回合增益，也不应默认为跨战永久增益。

OnCombo等特殊触发与效果阻断、命令队列的所有细节本轮未完全建模。尤其 OnPlay 中尾部追加效果会改变其局部combo开关，不能直接推导所有复杂宝石组合的行为。

### ReverseComboGemEffect

`OnGemAddedToCard` **0x18298e370** 设卡牌 `_doComboReverse`。`CardModel.OnPlayCard` **0x18290cbd0** 在出牌效果处理后才调用 `PlayerModel.SetComboReverse` **0x182953320**，设玩家反向状态。

已有主出牌方法 **0x182955870** 的后半部确认：若刚打出的卡没有 `_doComboReverse`，清除玩家反向状态；有则保留。`CardCostType.DoesCardCombo` **0x18271c380** 使用当前玩家反向状态判断当前牌：基础规则是下一费用=上一费用+1；反向状态还允许下一费用=上一费用−1，原+1路径仍保留。

实现顺序应是：**用上一张留下的反向状态判断这张牌 → 结算本张效果 → 把下一次反向状态设为本张是否带反向宝石**。不能在判断本张牌前就启用它自己的反向宝石。普通下一张消耗这个机会，连续带反向宝石可以继续允许下降。`ResetComboValues` **0x182952480** 本身不清反向；既有 `OnEndTurn` **0x18294f1a0** 按特殊解锁条件清反向，未实现该特殊解锁的原型可以在回合结束清零。

## 尚未证明的部分

- 所有宝石的完整运行时行为、进化/封印/井/特殊事件取得概率、商店价格分支、全部频率回退逻辑。
- 自由拆卸与满槽替换UI。底层方法存在不代表普通流程开放。
- 所有牌类/特殊费用类型/宝石组合的命令队列和回调重入顺序；本轮已确认的简单宝石可先实现。
- 原型新战斗运行时应携带实例ID、槽数、已装宝石，不在洗牌/抽牌/战斗开始时丢失。跨新一局是否保留宝石不能由槽位元进度反推；这里没有证明宝石随元进度永久继承。
