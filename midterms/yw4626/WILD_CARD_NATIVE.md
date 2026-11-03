# v9 W 万能牌、四叶草花瓣与销毁

> v10 更正：本文关于 Clover 默认配置 false 的记录仍有效，但“始终不乘连击”的推断已被运行时 WildStrength 覆盖机制补充。完整条件、获取途径、15种W配置见 [WILD_ACQUISITION_V10_NATIVE.md](WILD_ACQUISITION_V10_NATIVE.md)。


2026-10-29，复用 REA 元数据和原版静态证据。本轮原生结果在 `evidence/wild-v9-native/`，构建哈希与 `ATTACK_PATTERNS_NATIVE.md` 相同。机器规则摘要见 [rules.json](evidence/wild-v9-native/rules.json)。卡牌资源完整数值由本轮配置产物另行保留。

## W 是费用类型，不是普通零费数字牌

- `WildCostType.GetCostToPlay`（`0x1805f90e0`）直接返回0。实际支付和 `GetCardComboCost` 都通过该费用类型，所以 W 不扣法力，也不把自身费用变成“上一张费用+1”。
- `WildCostType.DoesCardCombo`（`0x1805f90f0`）恒返回true：W 能接续当前连击。
- `CardModel.CanCardCostTypeCombo`（`0x18290b3b0`，复用旧 native 证据）在上一张为Wild、当前不是Mild时直接返回true。因此 W 还能接后续任意普通费用牌，而不是要求下一张费用1。
- `PlayerModel.TryPlayCard`（`0x182955870`）将 W 的连击费用记录为0，并在下一张判断时保留上一张卡的类型语义。`WildCostType` 继承默认 `UpdateComboAfterPlay`（`0x182630a50`），成功出牌仍使连击次数加1。
- 类型判断的静态全局已解码验证：`0x184cf2e70→WildCostType`、`0x184c89308→MildCostType`、`0x184cf7ae0→XCostType`；不是凭分支形状猜测类型。

实现应独立保存“上一张是W”的状态。例如已有2费牌 → W → 5费普通牌仍能连击；5费牌仍需支付其真实费用。W不是免费打出下一张牌的效果。

## 四叶草花瓣

`Card_E_CloverPetal` 的配置是 Wild、LuckEffect +5、DrawCardEffect 1、DestroyEffect；`ReceivesComboMultiplier=false`、isPickup=true、addToRewardPool=false。

`CardEffectsModel.OnPlayCard`（`0x182904c00`，复用 gems-v6-native）以 CardModel 的 ReceivesComboMultiplier（`+0xa1`）限制传给效果的 `isInCombo`。因此该卡本身不把幸运和抽牌数乘当前连击；它仍可推进连击链。`LuckEffect.OnExecuted`（`0x182708780`）执行通用数值修正后调用 `SimpleStat.AddValue`，基础状态下正是幸运+5。

PlayerModel资源中的Luck `_resetAfterEncounter=0`，幸运保留到本局后续战斗。**不要使用预制体 `_defaultBaseAmount=100` 作为实际开局幸运。** `PlayerStats.ResetValues`（`0x182741470`，复用 gems-v6-native）用 `GetStartingLuck`（`0x18273c6b0`）覆盖当前值：PlayerConfig.baseLuck + 角色修正 + 进度PowerUp + 已有局内修正。当前PlayerConfig.baseLuck=0，无额外加成的新局从0开始，花瓣后为5。

`PlayerStats.get_LuckMultiplier`（`0x182743810`）返回 `1 + currentLuck/100`，所以Luck5为1.05倍，不能把它当105点再重复加100%。

## 销毁是从本局牌组移除

`DestroyEffect.OnExecuted`（`0x1826fd820`）在没有特殊防销毁宝石、且不需留在连击堆时送卡到DestroyPile；若该卡留在连击堆，则由 `OnRemovedFromComboPile`（`0x1826fd8c0`）在离开连击堆后处理。

完整闭环：DestroyPileModel.OnCardAdded（`0x1829162b0`）→ ReturnCardToPoolCommand协程（`0x18291ac00`）→ PlayerModel.ReturnCardToPool（`0x182952ae0`）→ **RemoveCardFromDeck（`0x182951980`）**。因此该实例不会在下场战斗重新回到牌组；这也不是移除玩家的卡牌解锁或整个账户库存。

销毁不等于破碎断连。原型若较早把实例放入销毁记录，仍须保留Wild桥接状态，确保下一张非Mild卡可以接续。

## 已确认的幸运用途

`ChooseGemModal.GetGemChoices`（`0x182a03f80`，复用 gems-v6-native）生成宝石选项时掷一次概率：

```text
p = (LuckMultiplier - 1) × LuckChanceModifier
  = currentLuck / 100 × 0.1
成功：选项数 = clamp(基础选项数 + 1, 基础选项数, MaxChoices=5)
失败：保持基础选项数
```

所以基础三选一、Luck5时，额外出现第四个宝石选项的概率为0.5%；不是5%，也不是稳定四选。取消后重新打开同一宝石箱应保留已经生成的选项，避免重新掷骰。

另有升级混合奖励分支 `ChooseCardModal.PopulateCardRewardChoices`（`0x1829fcfb0`，复用 levels-v7-native），在GemHammer遗物已解锁条件下按 `BaseGemChance/100 + (LuckMultiplier-1)×LuckScaleFactor` 决定3或4项；该池混合卡牌和宝石。原型若只有普通卡奖励，不应直接声称完整恢复此分支。

本轮没有新增原版运行时采样；静态证据已经覆盖付款、前后连击、效果倍数、跨战斗幸运、永久局内销毁和宝石选项概率。掉落频率与原版所有拾取位置仍需另外验证。
