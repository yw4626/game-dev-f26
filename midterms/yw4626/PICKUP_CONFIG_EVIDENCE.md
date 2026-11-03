# 可破坏物、法力和护腕拾取配置（v7）

结论：原版共享场景资源存在两类专用推车。`DestructibleCart_AlwaysMana.prefab` 的掉落表只有法力，`DestructibleCart.prefab` 的掉落表只有护腕，权重均为 1。法力拾取量为 1；护腕拾取的属性枚举为 10，增量为 1，原生分析映射到 DealCount。不能将这项证据改述为“任意罐子/火把随机掉法力或护腕”。

## 证据和复现

沿用 REA 工作流，读取原版安装文件及之前恢复的 IL2CPP 类型布局，用 UnityPy 与 Odin 解码。原版安装只读，未复制美术资产。脚本与数据在 `evidence/pickups-v7-config/`：

- `extract.py`：提取 567 条相关组件、配置对象，0 条解析失败。有 Odin 数据的对象全部消耗完整字节流。
- `configs.json`：每条对象保留源资源文件、path ID、对象 SHA-256、字段和 Odin 数据。
- `objects.json`、`transforms.json`、`containers.json`：用于从子对象追到实际资源包容器的 prefab 路径，避免根据匿名组件猜物件身份。
- `names.json`：解析 DropConfig→DropTag→PropDefinition 的名字与引用。
- `prepare-inputs.py`、`implementation-inputs.json`：压缩拾取量、属性设置、推车掉落、相关卡牌和本地化。
- `import-pickup-configs.py`：从上述紧凑证据生成 `dist/pickup-catalog.js`，供原型读取。

从工作区根目录运行：

```powershell
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\pickups-v7-config\extract.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\evidence\pickups-v7-config\prepare-inputs.py'
& 'tools\unity-assets\Scripts\python.exe' 'vampire-crawlers-prototype\import-pickup-configs.py'
```

主要源文件 SHA-256：

| 文件 | SHA-256 |
| --- | --- |
| biome-shared_assets_all.bundle | `1c7f25a5ad108a36c15a3e359cb5f9edaa6a5f870933ac8ede2e14343571a4f6` |
| biome-madforest_assets_all.bundle | `59a167ac0a60284439232b972399a5ffd4e4673d6817d33b0b830151e70ee354` |
| level3 | `965798146940324500973cb586eebad56714d991aebd77b9581efcf7deeaf191` |

原版全球配置、共享 assets、MonoScript bundle、英文/简体中文 localization bundle 的路径与散列保留在生成数据 `sources`。巨大 path ID 在紧凑输出中使用字符串，避免 JavaScript 精度损失。

## 已确认的拾取物

| 原版对象 | 组件 | 字段 | 数值 |
| --- | --- | --- | ---: |
| DestructibleMana | DestructibleMana | `_amountToGive` | 1 |
| DestructibleBracer | DestructibleStatItem | `_statToIncrease=10`, `_amountToGive` | 1 |
| DestructibleReroll | DestructibleStatItem | `_statToIncrease=15`, `_amountToGive` | 1 |
| DestructibleCandelabrador | DestructibleStatItem | `_statToIncrease=0`, `_amountToGive` | 10 |
| DestructibleSpinach | DestructibleStatItem | `_statToIncrease=4`, `_amountToGive` | 20 |
| DestructibleAmount | DestructibleStatItem | `_statToIncrease=1`, `_amountToGive` | 1 |

原生分析已映射：10=DealCount、15=Rerolls、0=Area、4=Might、1=Amount。当前生成的可用目录仅导出法力和护腕；其余资源是证据，不自动启用所有属性系统。

独立法力掉落 prefab 的组件 path ID 为 `3898630981220817671`，SHA-256 `7ba7ef4880a17c305b4e7abdce7051dd6b94a2d86ea93801a7f2b9301e5e4c28`。原版法力雕像里还嵌有另一份 DestructibleMana，数量同为 1，不能错误地按“两个组件”叠成每次 +2。

独立护腕掉落 prefab 的组件 path ID 为 `825561928119286129`，SHA-256 `948f4bfc873303d428f5b0cde8d0f2b8b284cf9796f06fc5567ca6c9dea0be61`。它位于 `Assets/_GameAssets/_Content/BaseGame/_Biome-Common/Props/Prefabs/Drops/DestructibleBracer.prefab`。

护腕的中文“护腕”、英文“Bracer”取同名原版卡牌 `Card_S_2_Bracer` 的本地化；该卡牌本身也用 DealCountEffect，`_countIncrease=1`。目录中的“法力”是 Mana 属性的功能译名，不虚构一种原版名为“法力结晶”的道具。

## 两种推车的精确掉落表

| 推车 prefab | SpawnDestructibleOnDestroy path ID | 唯一 DropConfig | 权重 |
| --- | --- | --- | ---: |
| DestructibleCart_AlwaysMana.prefab / Cart | `5617279368407838442` | DropConfig_Mana | 1 |
| DestructibleCart.prefab / Cart | `7877511508468777794` | DropConfig_Bracer | 1 |

上表的 prefab 身份是通过 GameObject→Transform 父层级→AssetBundle 容器路径直接确认。两条 SpawnDestructibleOnDestroy 对象 SHA-256 分别为 `bd105ac9a4806da21c8edef9618529eee19e4a9fda45030d9fe59ee03457a57e` 与 `d746d1a02b3c2f2bcadfde3aec6ea172bbd7f34b1e48050b87c570a3e2053719`。

DropConfig_Mana → Tag_ManaDrop → Shared_ManaDrop（asset GUID `fa2034552ad0d0846915f1e03cfe9944`）。DropConfig_Bracer → Tag_BracerDrop → Shared_BracerDrop（GUID `d9db683946a926b43ada6c451b4037ac`）。这两份 DropConfig 都使用 DefaultUnlockType、`_unlocked=true`。PropDefinition 的地址引用 GUID 已保留；本轮没有额外解码 `catalog.bin` 的 GUID 到地址映射，具体拾取 prefab 则已独立由资源包容器确认。

另有原版 `DestructibleGargoyle` / `DestructibleRailCart` 的掉落权重为 Coin60 / Card30 / Reroll10；MadForest_Bumpable 则为 MadForestCards2 / Area3 / Might4 / Amount1。因此不能把所有可破坏物合并成同一掉落表，也不能把同名 Cart 子对象错认成同一种推车。

## 法力、抽牌与手牌容量的区别

PlayerConfig（sharedassets0.assets:31245）：`baseMana=2`、`baseDealCount=3`、`maxMana=1000000`。后者是技术限制，并非普通游戏里个位数的“每回合法力上限”。原生 DestructibleMana 拾取协程调用 `PlayerStats.IncreaseMana(amount,true)`，增加当前法力和 StartingMana；它没有将 maxMana 增加 1。

PlayerModel（level3:24810，SHA-256 `39ebc29b2d5d78da59a117465f4189e237d198e9caedec65a7faa6a11ff5cfd7`）的序列化 `_playerStats` 提供：

| 属性 | `_statModifierType` | `_resetAfterEncounter` |
| --- | ---: | --- |
| DealCount / Might / Amount / Area / Mana | 0 | true |
| Armor | 1 | true |
| Rerolls | 2 | false |

原生 DestructibleStatItem 拾取使用 `SimpleStat.AddRunValueModifier(amount,true)`，不同于普通卡牌效果只增加当前值的行为。DealCount 的原版名字是 `{GlobalKeywords.Handsize}`，描述为 `Increase {GlobalKeywords.Handsize}.` / `增加{GlobalKeywords.Handsize}。`；因此不能仅按字段名将它解释为“立刻抽一张”，也不能单凭名字猜所有手牌上限计算。

GlobalConfig `runModeConfig`：BaseHandSizeLimit=4、MaxHandSizeLimit=7、HandSizeDrawOffset=0。PlayerStats 的 `_maxValue=0` 是初始化前序列化占位值，不能当作 DealCount 最终运行时上限。最终 DealCount 如何参与开局/每回合抽牌与手牌上限，必须结合本轮原生分析，不能从配置名称推测。

本次拾取收益作用于当前探索。开始新的一局时是否从元进度获得额外基础属性，是另一个系统；这里没有将地牢拾取保存成永久账号属性。`resetAfterEncounter=true` 也不表示拾取收益会丢失，因为该拾取增加的是本局基础修正值。

## 原型适配边界

`PickupCatalog.items` 导出 `mana` 和 `deal`；`PickupCatalog.breakables` 导出 `manaCart` 和 `bracerCart`，携带源表和 prefab 路径。每层放几个、选哪些空地、图标和文字表现，是原型布局适配；本轮并未证明“每层恰好各一个”是原版生成规则。使用这些已确认专用物体，比把增益无依据地加入所有罐子更能保持掉落来源准确。

已验证生成 JavaScript 可由 Node 读取，两项数量都是 1，两种推车掉落项与提取 JSON 一致。尚未将本轮静态结果标作原版实机采样。
