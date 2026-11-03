# 宝石与卡牌配置证据（v6）

本文件记录本地原版安装包的静态配置提取。数值来自游戏资源，不代表逐项实机验证。原版安装目录保持只读；这里不包含原版贴图或可执行代码。原生函数的执行语义由本轮独立的原生分析记录补充。

## 来源与可复现过程

来源目录：`D:\steam_data\steamapps\common\Vampire Crawlers\Vampire Crawlers_Data`。

| 文件 | SHA-256 |
| --- | --- |
| globalgamemanagers.assets | `8d447c918d6ff99508d975a9d362d367a2ab5527d66b901d3e0a5328d4fe451c` |
| sharedassets0.assets | `e53850e22d4057d7e735f530a2ce7187d1d0bbde841fb04e1c225620d344d035` |
| sharedassets3.assets | `54ca5f8a4becbded889b252e6eb43606feb939622700e4aa4c8b5de9cd157a79` |
| level3 | `965798146940324500973cb586eebad56714d991aebd77b9581efcf7deeaf191` |

`evidence/gems-cards-v6-config/extract.py` 使用已有 IL2CPP 类型布局生成器、UnityPy 与 Odin 二进制解析器，成功读取 460 条相关对象，其中有 64 条 GemConfig；有 Odin 字节数据的成功对象均完整消耗字节流。`errors.json` 明确保留 7 条失败：3 条 GemDatabase、3 条 GemTagDatabase 的泛型类型树，以及 1 条 InsertGemModal 引用类型节点。**没有据此宣称全部宝石已解锁、启用或能在某次游玩中出现。** 41 条单独的 GemTag 和 5 个标签组已成功提取；静态允许标签以这些已发现标签的并集为基础。

`prepare-inputs.py` 将引用解析为资源名，读取英语、简体中文原版 localization bundle，并合并此前提取的 `reverse_engineering/vampire-crawlers/configs/cards.json` 与 `decoded-configs.json`。英文、中文 bundle 哈希、每个对象的文件名、path ID、对象 SHA-256 均保留在 `implementation-inputs.json`。path ID 使用字符串，避免 JavaScript 整数精度损失。原始完整对象在 `configs.json`，原版本地化在 `localization.json`。

从工作区根目录重建：

```powershell
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\gems-cards-v6-config\extract.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\gems-cards-v6-config\prepare-inputs.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\import-extra-configs.py'
```

最后一步只需要 Python 3 和已提取 JSON，生成 `dist/extra-cards.js`、`dist/gem-catalog.js`，不改原来的基础 catalog。两者均可用浏览器全局变量或 Node CommonJS 读取。`ExtraCardCatalog.cards` 包含 8 张额外卡；`GemCatalog.gems` 包含 10 个**候选**宝石，是否启用由引擎明确选择。额外配置附带完整来源数组。

## 宝石数值与限制

| 原版配置后缀 | 导出 key | 原版简体中文名 | 直接配置 | 频率档 |
| --- | --- | --- | --- | --- |
| Mana_Minus1 | costDown | 减少法力消耗 | ManaGemEffect `_manaChange=-1` | Common |
| Mana_Plus1 | costUp | 增加法力消耗 | ManaGemEffect `_manaChange=1` | Common |
| DoubleDamage | double | 双倍伤害 | DamageMultiplierGemEffect `_multiplier=2` | Common |
| TripleDamage | triple | 三倍伤害 | DamageMultiplierGemEffect `_multiplier=3` | Epic |
| FreeToPlay | free | 免费 | FreeToPlayGemEffect | Legendary |
| ReverseCombo | reverse | 逆向连击 | ReverseComboGemEffect | Uncommon |
| Draw | draw | 抽牌 | trigger 0 → DrawEffect `drawCount=1` | Rare |
| Armor | armor | 防御 | trigger 0 → ArmorEffect `_armorAmount=2` | Common |
| Might | might | 力量 | trigger 0 → MightEffect `_mightAmount=10`, permanent=false | Common |
| Amount | amount | 发射数量 | trigger 0 → AmountEffect `_amount=1`, permanent=false | Rare |

表内配置名均以 `GemConfig_` 开头。GemCatalog 同时保留 `rawEffects` 和原版文字；简短 UI 功能说明是原型解释，不冒充原版字符串。FreeToPlay 原版英文描述是未展开的关键字占位符，因此界面不能直接照抄。

这 10 条配置的 IsUnique 均为 false；这**不表示任意重复与组合都合法**。例如 costDown 排除 `GemTag_ManaIncrease`，costUp 排除 `GemTag_ManaDecrease`；reverse 排除自身 `GemTag_Reverse`；free 排除整个 CostChange 和 Mana 标签组，其中包含 Reverse。原生分析已确认先应用所有已装宝石的动态排除，再应用动态包含。卡牌支持任一宝石标签、剩余空槽和唯一性仍需要分别检查。

特别排除：`GemConfig_UpgradeDamage` 的原版名为 `Upgrade (NOT USED)`、描述 `NOT USED`，没有正常频率配置，未作为可获取强化宝石导出。`GemConfig_Heal` 实际装配的是 RecoveryEffect、值 2，不能误实现为立即回血 2。

卡牌的无宝石初始允许标签、排除标签/标签组、初始槽数、最大槽数、基础槽费保存在 `GemCatalog.cardSlots`，同时支持 162 个 asset ID 与当前 15 个可玩卡牌 key。标签组保存在 `GemCatalog.tagGroups`。这不是已装宝石之后的动态允许标签缓存；引擎必须在镶嵌前重新计算。

已有攻击卡和这次 8 张新攻击卡初始均为 1 槽。原型中的念力法球、黄金护甲原版初始槽数为 0、最大 2。新卡飞刀、彪悍猫、国王圣经、痕印石最大 2 槽，其余四张最大 3 槽。初始槽与最大槽应分开表示。

## 获取权重与强化费用

| Frequency | 宝箱权重 | 升级权重 | 升级 LuckFactor |
| --- | ---: | ---: | ---: |
| Common | 160 | 60 | 0 |
| Uncommon | 120 | 30 | 0.03500000014901161 |
| Rare | 80 | 20 | 0.06499999761581421 |
| Epic | 60 | 6 | 0.30000001192092896 |
| Legendary | 40 | 0 | 0 |

宝箱 T1 频率组为 Common/Uncommon/Rare；T2 为 Rare/Epic/Legendary；T3 为 Epic/Legendary。单个 GemConfig.Weighting 与频率档权重是不同字段，均已保留。静态权重不是直接百分比，不能跳过池过滤、频率选择、解锁和幸运值语义来宣称最终概率。

GlobalConfig `blacksmithShopConfig`：BaseSlotFee=500，SlotFeeMultiplier≈1.1，BaseFrequencyChangeFee=500，FrequencyFeeMultiplier≈1.1，JewellerPriceCap=50000，BaseSealGemPrice=50000。具体卡牌另有 `_baseSlotCost`；具体宝石另有 BaseFrequencyPrice 和 SealingCost。**这些字段不等于地牢商店每颗宝石的购买价格，也不能仅凭字段猜测完整费用公式。** `gemChoiceModalConfig` 的 MaxChoices=5，LuckChanceModifier≈0.1。ChooseGemModal prefab（sharedassets3.assets:25561，SHA-256 `862587a015ccd234630d1b5d80daface8f0dc29f72527e541bc9b4dff8db8141`）未序列化初始选项个数字段，不能从它推断固定三选一。

## 新增卡牌的原始等级值

伤害列为「每击基础伤害 × 基础次数」，不含威力、发射数量、连击与宝石倍率。费用以实际 `config_get_mana_cost` 为准，例如 asset ID 带 `_4_` 的 Phiera 实际费用是 3。

| key / 原版名 | 费用 | 等级 0 | 等级 1 | 等级 2 |
| --- | ---: | --- | --- | --- |
| knife / 飞刀 | 0 | 8×5 | 10×6 | 10×10 |
| cat / 彪悍猫 | 1 | 20×2 | 20×4 | 25×4 |
| bible / 国王圣经 | 1 | 8×5 | 12×5 | 16×5 |
| runetracer / 痕印石 | 1 | 15×1 | 20×2 | 20×3 |
| carrello / 推车 | 2 | 15×3 | 20×3 | 20×3 |
| celestial / 英华天落 | 2 | 30×3 | 40×3 | 65×3 |
| lightning / 闪电戒指 | 2 | 25×5 | 25×6 | 30×8 |
| phiera / 图菲罗街市 | 3 | 25×5 | 30×6 | 35×8 |

全部 8 张的 `_amountScalesWithCombo=true`、`_damageScalesWithCombo=false`、`_damageScalesWithAmount=false`；其余 ignore 标志按源配置直接复制，不推测默认值。`levels` 导出原版等级 0–2，`originalLevels` 保存这三档完整伤害配置，`originalEffects` 仍保留全部原始效果与等级资料。

本轮额外卡牌导出支持当前引擎的基础伤害、次数、连击标志。原版随机选敌、左右目标顺序、穿透、暴击、击退、彪悍猫混战与英华天落等专属行为在证据中保留，**这些字段本身不会自动实现相应机制**。不得将这些基础卡牌适配称为完整还原原版武器行为。推车等级 1 和 2 的基础伤害/次数相同，不应为了让升级看起来有效而篡改源值；其他原版字段可能变化。

验证：生成文件可由 Node 解析；检查 8 张卡的三个等级、原始 flags、10 个候选宝石数值、当前 15 张卡的槽位元数据与源 JSON 一致。所有成功 Odin 对象读取完整；已记录的泛型数据库与 UI 节点失败不隐藏、不当作运行时缺失。
