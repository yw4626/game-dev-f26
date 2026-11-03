# 19 条进化配方与完整材料配置

本表来自本机游戏的 Unity CardConfig / CardGroup 对象，不是根据其他 Vampire Survivors 版本或图片猜测。生成器为 `import-evolution-v10.py`；浏览器/CommonJS 数据为 `dist/evolution-v10.js`（`EvolutionV10`）。机器证据 `evidence/evolution-v10-config/implementation-inputs.json` 保存了 19 条配方、78 张材料/成品牌、38 份攻击配置、每卡宝石槽和排除标签，以及原始效果链与输入文件 SHA-256。此文不把资源存在等同于全部效果已实现。

## 原版资源配方

材料按 CardGroup 匹配，允许该组中不同费用的卡；这些费用变体不是普通卡的升级等级。`componentKeys` 和 `requiredAssetGroups` 保存全部变体，不能只比较卡名或只检查某一费用版本。三材料配方需要三张不同实例。

| 原型成品键 | 原版材料组（代表卡） | 基础费用 | 基础每击伤害 × 发数 | 额外效果 / 证据边界 |
|---|---|---:|---|---|
| gorgeousMoon | Pentagram + Crown | 1 | KillEffect 派生，不可按普通伤害处理 | GorgeousMoonEffect；弃牌修改费用、抽回重置费用 |
| bloodyTear | Whip + Hollow Heart | 2 | 4 × 10 | Whip 有效穿透5；暴击与暴击回血2 |
| holyWand | Magic Wand + Empty Tome | 2 | 20 × 8 | 右至左，攻击意图优先 |
| unholyVespers | King Bible + **Spellbinder** | 2 | 12 × 10 | 左至右，击退40 |
| valkyrieTurner | Shadow Pinion + Wings | 2 | 25 × 1 | ValkyrieTurnerEffect，FrontRow，每目标一投射物 |
| viciousHunger | Gatti Amari + Stone Mask | 2 | 20 × 5 | ViciousHungerDamageBehaviour：coinChance10、luckScaling0.1、coinAmount10 |
| deathSpiral | Axe + Candelabrador | 3 | 20 × 8 | FrontRow 有效穿透5；暴击25%、倍率2 |
| heavenSword | Cross + Clover | 3 | 5 × 4 | Random/MultiHit、穿透5；暴击50%、倍率2.5；BouncyEffect |
| hellfire | Fire Wand + Spinach | 3 | 15 × 15 | 随机列袋，击退40；canCrit=false |
| noFuture | Runetracer + Armor | 3 | 15 × 1 | RuneTracerDirection 有效穿透1；canCrit=false；2026-10-29 查明还存在 NoFutureProjectile 碰边爆炸伤害，原型未接入，见 EVOLUTION_VALUES_AUDIT.md |
| soulEater | Garlic + Pummarola | 3 | 20 × 1 | FrontRow；另有 Heal2、RemoveIntentEffect |
| thousandEdge | Knife + Bracer | 3 | 20 × 10 | 左至右；暴击50%、倍率2 |
| fuwalafuwaloo | Vento Sacro + Bloody Tear | 4 | 60 × 20 | **本构建 [NOT USED]，默认未解锁，图鉴禁用** |
| laBorra | Santa Water + Attractorb | 4 | 30 × 5 | LaBorraDamageEffect 派生处理 |
| phieraggi | Phiera Der Tuphello + Eight The Sparrow + Tirajisu | 4 | 35 × 10 | 三材料；PhieraggiEffect，revivalScaling0.01、cap10 |
| thunderloop | Lightning Ring + Duplicator | 4 | 15 × 10 | ThunderLoopEffect 派生处理 |
| vandalier | Peachone + Ebony Wings | 5 | 100 × 5 | VandalierEffect，prefabHandlesWeaponSpawning，击退100 |
| infiniteCorridor | Clock Lancet + Silver Ring + Gold Ring | 6 | 0 × 1 | 三材料；**本构建 [NOT USED]，默认未解锁，图鉴禁用** |
| mannajja | Song of Mana + Skull O'Maniac | 5 | 75 × 1 | SongOfManaEffect、manaMultiplier0.01；生成2张临时牌 |

“每击伤害 × 发数”不是总伤害。穿透、有效前排、死亡补位、连击、属性、暴击与派生效果会改变实际命中。表中基础值只描述序列化配置。King Bible 材料明确为 `CardGroup_Spellbinder`（咒缚盒），并非 Torrona。

## 标识、支持状态与宝石

资源名、AssetId 和费用不是同一个字段。例如 MagicWand 的 AssetId 为 `Card_A_1_MagicWand`，实际费用0；SoulEater 的资源名为 `Card_A_3_SoulEater`，真实 AssetId 却为 `Card_A_1_SoulEater`，实际费用3。Wings 的序列化 manaCost=4，但 WildCostType 的支付费用为0。代码必须使用导出的 `assetId` / `cost` / `costType`，不能拆文件名数字。

`recipes[].sourceDisabled` 对应源资源明确未使用/默认禁用，不能由原型解锁适配覆盖。`runtimeSupported`、`unsupportedEffects` 是 **v9 引擎接入前能力快照**；v10 新增消费者后，实际启用由引擎决定。`originalEffects` 保留所有 Odin 主效果和抽牌、弃牌、回合末等钩子，`criticalEffects` 与 `canCrit` 分别保存。NoFuture 虽有序列化暴击回血配置，canCrit=false，因此不能自行执行它。

`cardSlots[key]` 与 `cardSlots[assetId]` 指向相同元数据，含初始槽数、最大槽数、扩槽价格、原始排除组/标签和初始 allowedGemTags。运行时动态排除/包含和唯一性仍由已验证的 gems helper 计算。进化材料消耗与宝石转移参见 `CHARACTER_EVOLUTION_NATIVE.md`：创建新成品实例，删除选中的全部材料，只继承主武器槽数与宝石，进化宝石占一个空槽，不合并辅助牌宝石。Boss 后提供进化/新卡/镶嵌三选入口由原型安排，配置本身不证明原版入口完全相同。

## 属性生命周期

`statLifecycles` 来源 PlayerModel 序列化 SimpleStat：Armor、Might、Amount、Area、Recovery、Mana、DealCount、Magnet、Scavenge 会在战斗后重置；Growth、Greed、Luck、Duration、Health、RevivalCharge、RevivalStacks 等不采用该重置标志。具体加值仍要结合各 Effect 和 ResetValues 调用，不能把 prefabDefault 当新局初值。例如 Luck prefabDefault=100，但原生新局重设来自 PlayerConfig.baseLuck=0。

Spellbinder 是0费 Duration+2。Candelabrador 的0/1/2费变体为 Area+5/+10/+15；SilverRing 为 Duration+2、Area+10；GoldRing 为 Curse+10、Charm+5。Crown 的0/1/2费变体为 Growth+5/+15/+20 并销毁。完整其他数值以 `effectDescriptors` 和 `originalEffects` 为准；没有消费者时不能仅显示文字而宣称效果完整。

## 升级奖励首次免费：原生证据与原型适配

`evidence/wild-acquisition-v10-native` 中的 ChooseCardModal.CardChosen → AddCardAndCloseModal / MoveChosenCardToHand 设置 `SetCardFreeToPlay`（0x18290e080），写 `_isFreeToPlay=true`，不是 `_isTemporaryFree`。进入 DrawPile 的 MoveChosenCardToDeck 分支未设置该免费。`HandPileView.OnCardPlayed`（0x182794170）首先执行 ReturnFreeToPlayToDefault，恢复 CardConfig.FreeToPlay，即使牌打出后返回手牌也会重置。

因此证据支持直接进入手牌的新奖励牌 **下一次成功打出免费**，原本费用仍用于连击判定；不支持将费用数值改成0，也不支持把局外奖励全部设为免费。用户要求“当回合免费”时，原型额外在回合末清除此标志属于明确适配；本次原生证据没有证明未打出牌在回合末自动失效。

## Area 精度注意事项

已有 `attack-patterns-v9-native/0x1826eb640.c`：DamageEffect.GetArea 在未忽略 Area 时返回 `(baseArea + snapshot.Area) / 100`。除数地址 VA0x183cc9858，经原 GameAssembly.dll 的 PE section 映射至文件偏移0x3cc8858，字节 `00 00 c8 42`，确认为 float100.0。`0x18274d3a0.c` 再计算 `normalizedArea × originalDamage × Global.areaDamageMultiplier`，当前配置约0.2。因此玩家 Area5 对应0.05，不可误当5；基础Area0时溅射系数为原每击伤害的1%。

`0x18274b3c0.c` 遍历当前存活前排列，不使用3D距离；主击后仍存活主目标也可进入该遍历。最终取整、击退和特殊 FrontRow 路径须结合原生执行链进一步核对，不因名称“范围”发明半径筛选。

## 复现与验证

运行 `tools/unity-assets/Scripts/python.exe vampire-crawlers-prototype/import-evolution-v10.py` 重建数据。`tests/evolution-v10-config.test.cjs` 验证19条配方材料组与真实 AssetId 一致、两条三材料配方、两条明确禁用资源、费用/标识陷阱、重要效果钩子、宝石限制，以及全部六个输入文件的 SHA-256。它验证资料完整性，不代替新增效果的引擎测试或原版运行时验证。
