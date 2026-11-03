# v14：阿卡与波的职业配置

2026-10-29。复用匹配本地构建的 REA/Ghidra 分析与 Unity/Odin 解码；本轮重新只读读取 `sharedassets0.assets` 中两张FCC和两套DeckConfig，共四个对象，其原始字节SHA256全部与旧解码吻合。没有运行原游戏或更改其文件。

## 新增角色

| 角色 | 起始属性修正 | 角色卡立即效果 | 角色卡响应 | 原始五张牌 |
|---|---|---|---|---|
| 阿卡 Arca | 生命 +5、法力 +1、威力 +30% | 1费；获得3法力 | 后续5张法力类型牌，每张再获得1法力 | 阿卡、火焰魔杖×2、空白之书、防御 |
| 波 Poe | 每回合发牌 +1、范围 +20 | 0费；本场战斗范围 +20 | 后续3张防御类型牌，每张抽1牌 | 波、大蒜×2、防御、烛台 |

表格是基础数值。两张FCC的 `ReceivesComboMultiplier=true`，立即效果随当前连击倍率增长；持续次数不乘连击。FCC响应不乘触发牌连击，抽牌效果仍加 `trunc(Magnet)`。范围20按v13公式对应每次主击额外4%的Area伤害，而不是提升20%总伤害。

## 配置来源与原始字节复核

| 对象 | Unity文件与Path ID | 原始对象 SHA256 |
|---|---|---|
| FCC_Arca | sharedassets0.assets:31726 | e7532cfed437aadf2a666600d9bf1afd973b6461f207abdead8f455a6783ed48 |
| 阿卡起始牌组 | sharedassets0.assets:31895 | fb7ee7dc26011dd906a7f50aedb6c3023e0089941c025e19619f80326e7a9a81 |
| FCC_Poe | sharedassets0.assets:31741 | 93f80e89a1d1e9cb26cf2c54d1f54016969fcbb7b5d2dae5e2d425ba2031c384 |
| 波起始牌组 | sharedassets0.assets:31902 | f005364a6cc0a0f505baabce792cf3f906e6eb1a228e63cd3dde39b9af3fef47 |

[import-characters-v14.py](import-characters-v14.py)用工作区 `tools/unity-assets/Scripts/python.exe` 运行，会先读取原游戏对象并验证哈希，再生成模块。完整原始效果和对象校验见[evidence/characters-v14/original-configs.json](evidence/characters-v14/original-configs.json)与[implementation-inputs.json](evidence/characters-v14/implementation-inputs.json)。

## 执行路径复核

- `FccConfig.OnPlayCard`，`0x182982ee0`，先执行普通出牌效果，再激活FCC；`PlayerRunSettings.GenerateDeck`，`0x1829c3c10`，读取首选角色的完整DeckConfig。沿用[evidence/characters-evolution-v8-native](evidence/characters-evolution-v8-native/)中的C/ASM证据。
- `FccConfig.TryTriggerFccReaction`，`0x182983630`，对可执行响应先扣一次持续次数，再调用 `Execute(...isTrigger=true,isInCombo=false)`；因此响应不乘连击。匹配的是卡牌类型，不是卡牌费用、命中次数或牌面颜色近似值。
- 阿卡的两个效果都是 `GainManaEffect`，参数分别 `_gainAmount=3/1`；原生 `GetModifiedEffectAmount`（`0x1827008a0`，`evidence/levels-v7-native/`）在非连击返回基础量。`OnExecuted`（`0x182700a50`，`evidence/pickups-v7-native/`）走法力增加路径，与地图增加起始法力上限不同。
- 波的 `AreaEffect.OnExecuted`，`0x1826e13c0`（`evidence/effect-consumers-v10-native/`），以 `_isPermanentGain=false` 进入Area的临时统计增量路径。因此FCC本次Area增益不写入跨战斗永久增长；职业基础Area修正仍由新战斗初始化应用。
- 波的响应 `DrawEffect.OnExecuted`，`0x1826fea30`，将基础/连击处理后的抽牌数与快照 `Magnet` 的整数部分相加。`GetDrawAmount`，`0x1826fe650`，也明确返回两者之和。文件在 `../reverse_engineering/vampire-crawlers/native/`。

## 适配边界

原版两名角色均 `purchasedByDefault=false`、`purchaseCost=300`，还带成就解锁条件；原型按用户要求在开始界面直接开放，不复刻城镇购买门槛。画像、角色定位标签和说明排版属于原型设计。未新增其他职业，也未做原游戏运行录像或全职业系统穷尽分析。
