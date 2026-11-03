# 角色经验、等级选择与永久解锁配置（v7）

本文件只记录原版安装包静态资源，并结合本轮原生分析区分三个系统：本局角色经验等级、卡牌效果的强化档位、城镇/账号永久解锁。不能将每场战斗结束、角色升一级、给旧卡加一级视为同一事件。

## 来源与重建

`evidence/levels-v7-config/extract.py` 复用本轮只读 UnityPy/Odin 提取器，将目标改为经验、奖励选择、卡牌、敌人、成就与永久进度。读入 globalgamemanagers.assets、sharedassets0/2/3.assets、level2/3、共享与 MadForest bundle。成功 825 个对象；3 个 AchievementDatabase 泛型类型树失败，错误及对象散列保留在 `errors.json`，不隐瞒。单独的 263 个成就配置已成功读取；不能以此宣称已恢复全部数据库成员关系。

`prepare-inputs.py` 保留源对象 SHA-256 和文件/path ID，解析本地化和卡牌解锁引用，输出 `implementation-inputs.json`。`import-progression-configs.py` 生成 `dist/progression-catalog.js`，浏览器全局名称为 `ProgressionCatalog`，也支持 CommonJS。

```powershell
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\levels-v7-config\extract.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\levels-v7-config\prepare-inputs.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\import-progression-configs.py'
```

生成目录提供：`levelConfig`、`levelChoice`、`crystals`、184 个原始敌人 XP 配置（另有 ghost/zombie/lion 别名）、162 个 cardUnlocks、263 个 achievements、`startingCharacters` 的原始牌组与角色属性、townProgression 的字段分类与来源。它不把原版 ProgressionData 默认 ScriptableObject 当成用户真实存档。

## 玩家经验配置

PlayerLevelConfig 位于 globalgamemanagers.assets:7746，对象 SHA-256：`05daec0aa478a046e39fad07eeaa6c1e70facf6ea284bff8ec991f3ab9093c77`。

| 字段 | 值 |
| --- | ---: |
| `_baseXpReq` | 5 |
| `_xpCurveExponent` | 2 |
| `_xpCurveMultiplier` | 5 |

原始 `_levelRanges`：

| Range.x–Range.y | XpIncreasePerLevel |
| --- | ---: |
| 0–5 | 10 |
| 5–10 | 12 |
| 10–15 | 14 |
| 15–20 | 16 |
| 20–25 | 18 |
| 25–30 | 20 |
| 30–35 | 22 |
| 35–40 | 24 |
| 40–45 | 26 |
| 45–50 | 28 |

**范围端点、等级索引、累积经验还是单次阈值、平方曲线字段是否实际使用，必须以 PlayerLevelConfig 方法的原生代码为准。** 不能看到字段就直接用 `5*level²`，也不能将上表每一段的增量当成该等级完整升级所需经验。此生成脚本故意不提供猜测的 threshold 函数。

原型现有三个敌人的原版 `EnemyConfig.Xp`：Ghost=3、Zombie=4、LionHead=4。它们是源配置 XP，最终发放是否受 Growth、倍率、遭遇修正影响须跟踪原生死亡/经验路径。原型自定敌人没有原版 XP 证据，应显式使用适配值，而不能冠以“原版值”。

GlobalConfig 的 XP 晶体配置：collectCrystalsOnLevelUp=true，collectionRadius=0，maxCrystalsSpawnedPerEnemy=15；三个晶体档的 MaxXPValue 为 2、9、100，MinPercentage 分别约 0.4、0.3、1。它们用于呈现/划分经验晶体，不是三档独立敌人掉率。

## 等级选择资源

ChooseCardModal prefab 位于 sharedassets3.assets:21387，对象 SHA-256 `df09d63f9944553f254d245334a0ff8e216ed1943171479327ecc7738ffb6a1d`。它的 `_openSFX=UI_Levelup`，引用卡牌选择与宝石选择 prefab，并具有跳过、重抽、放逐按钮。资源中未序列化“固定三选一”的选项数字，默认值应由构造函数/调用参数确认。

GlobalConfig `cardLevelConfig`：

| 字段 | 原始值 |
| --- | ---: |
| minLevelForLevelUps | 0 |
| weaponsOnlyUntilLevel | 2 |
| newCardsOnlyUntilLevel | 2 |
| cardsInDeckMultiplier | 0.8999999761581421 |
| normalCardChance / normalLevelUpChance | 0.800000011920929 / 0.19999998807907104 |
| singleTypeCardChance / singleTypeLevelUpChance | 0.949999988079071 / 0.050000011920928955 |
| levelUpChoiceLuckFactor | 0.02500000037252903 |
| BaseGemChance | 15 |
| LuckScaleFactor | 0.10000000149011612 |
| GemLuckCap | 3000 |

这些是原始配置分支参数，不是直接说明“20%概率把任意旧卡伤害提高一级”。是否选择新卡、宝石、其他奖励，及哪些字段用于当前分支，必须配合原生候选池与选择函数。这里保留字段原名，不通过译名替代调用证据。

卡牌奖励元数据另有：CardLimit、RewardProbability、addToRewardPool、cardGroup、group._isWeapon、特殊奖励池费用覆盖、默认/成就解锁。当前普通攻击卡常见 RewardProbability=1、CardLimit=1000，但这不表示所有卡最终等概率；已有卡数量折扣、费用池、分组、解锁、放逐均可能改变候选。

## 本局等级不等于永久解锁

ProgressionData（sharedassets0.assets:31243，对象 SHA-256 `d8cfee3b67bcc705acf93660a8c98d48245fa6f25268a2c06b1a054607d4b8b6`）包含 `_charactersPurchased`、`_powerUpLevelsUnlocked`、`_powerUpsEnabled`、`_achievementsUnlocked`、`_discoveredCards`、`_buildingsVisited`、`_dungeonsVisited`、`_cardGemSlots`、`_gemFrequencyIndexes`、封印等独立字典。

ProgressionDataConfig：默认角色槽数 1、默认 Arcana 槽数 1，另引用总金币与教程成就。此默认资源不提供当前用户的真实解锁状态；例如“发现过卡牌”不应自动等于“购买角色”或“满足所有卡池解锁条件”。

已解析的卡牌解锁例子：

| 卡牌 | 原版 UnlockType / 条件 |
| --- | --- |
| Whip、Knife、KingBible | DefaultUnlockType，unlocked=true |
| FireWand | MetricAchievement_FireWand：摧毁 20 个光源 |
| Carrello | MetricAchievement_Carrello：摧毁 5 辆矿车 |
| LightningRing | MetricAchievement_LightningRing：击败 2500 个敌人 |
| GattiAmari | EndRunAchievement_GattiAmari：使用 FCC_Giovanna 达到角色等级 15 |
| Runetracer | EndRunAchievement_Runetracer：使用 FCC_Pasqualina 达到角色等级 10 |
| CelestialDusting | EndRunAchievement_CelestialDusting：使用 FCC_OSole 达到角色等级 30 |
| Bracer | MetricAchievement_Bracer：打出 KingBible 卡牌 99 次 |

上述三个 EndRunAchievement 的 `_mustCompleteDungeon=false`。这些条件是对应卡牌进入可用池的永久解锁条件，并非“不论使用谁，当前等级到 15 便立即获赠猫牌”。条件中的比较枚举与触发时点由原生实现确认；原版本地化和条件字段原样保留。

原型若为便于试玩预先开放这些牌，应明确其为演示用已解锁候选池。不能将锁定卡随机发给玩家后宣称完整复制了原版解锁进度。

## 卡牌强化档位另行处理

普通攻击 CardConfig 常见 `_maxLevel=4`，DamageEffect 有多档伤害数组；这说明原版存在效果强化数据，不证明每次角色升级或普通战利品都对旧牌加一级。上一轮原生证据已确认 DamageEffect.GetLevelConfig 与升级宝石计数有关。

多数支援牌 `_maxLevel=0`。例如 0/1/2/3 费的 EmptyTome 是不同 CardConfig，不能把费用变体误当成原牌 +1/+2/+3。当前用户要求取消原型的卡牌 +等级和战后选牌，是原型流程修正；角色 XP 触发的选卡应单独实现和展示。

## 默认 Antonio 的原始牌组

Antonio 的 `_isPurchasedByDefault=true`、purchaseCost=0、startingLevel=1。角色 statModifiers 中 healthModifier=10，其余为0；基础玩家生命50加角色修正后为60，尚不计其他元进度。

AntonioDeck（sharedassets0.assets:31894，SHA-256 `3d0d19730bf5f0e3036a740982af9074772dcf9b501d1d2d6ebb67ca1d6d7194`）有以下五项，每个数组条目就是一张：

1. FCC_Antonio
2. Card_A_0_Whip
3. Card_A_0_Whip
4. Card_D_0_Armor
5. Card_S_1_Spinach

原版初始牌组并非当前原型早期人为组合的14张。FCC_Antonio也不能随便替换成鞭子：它是0费角色卡，onPlayEffect为ArmorEffect +3，baseDuration=5；fccActions有 AttackCardTypeTrigger，触发 MightEffect +10，`_isPermanentGain=false`。激活、触发、持续次数、离场等运行时机制应以原生代码确认。如果原型暂缺FCC系统，采用四张普通牌并把角色能力另行简化时必须说明这项缺口，不能把四张叫作精确原版初始牌组。

验证：生成 JavaScript 可由 Node 解析；基础 XP、十档范围、三个已用敌人 XP、默认解锁与成就引用对照提取 JSON 通过。原版全候选池权重、账号存档和所有剧情/模式特例未在本轮静态配置读取中完全复原。
