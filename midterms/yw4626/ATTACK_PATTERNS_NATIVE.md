# v9 原版武器索敌、穿透与敌群队列

2026-10-29。本轮使用 REA 已保留的 IL2CPP 元数据、序列化配置和既有 Ghidra 数据库，定点执行只读反编译，没有修改原游戏。分析对象仍为 GameAssembly.dll SHA-256 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`，global-metadata.dat SHA-256 `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`；REA 元数据证据 ID `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`。

机器可读产物：[attack-configs.json](evidence/attack-patterns-v9-native/attack-configs.json)。包括全部已提取 DamageEffect 卡的原始攻击配置、16 张原型卡映射、各级数值、武器预制件/方向引用、源对象哈希以及当前支持卡的有效穿透规则。`levels[].pierce` 是序列化值，`effectiveBasePierce` 才是本轮核对后的基础有效值。其余非原型卡只保留配置和继承规则推断，不声称逐卡完整验证。

## 先确认：不是按卡名把攻击分成单体和全屏

国王圣经的配置是 `LeftRightTargeting`、基础 Amount=5、每击伤害8、Pierce=1、Area=0；斧头同样是 `LeftRightTargeting`，但 Amount=3、每击15、Pierce=2、Area=0。圣经因五发依次扫过前排，视觉上可以覆盖多个敌人；这不等于每一发都对全部敌人造成伤害。斧头也不能写成始终锁定一个敌人：它的每发可以横向穿透两名不同敌人。

示例只限五名前排均存活、无额外效果且不会被本次攻击击杀的情况：圣经从左到右五次，各列命中一次；斧头的三发各最多两次命中，列顺序持续前进并回绕，合计最多六次主命中。敌人不足、死亡补位、优先目标、Area、宝石、弹跳/Overkill 等会改变实际序列。

## 配置进入执行的完整共同调用链

两张卡均绑定普通 `DamageEffect`，不是基于名字分派独立伤害算法：

1. `DamageEffect.OnExecuted`，`0x1826eec10`，取当前等级配置并取得本卡效果对应的 TargetData。
2. `DamageEffect.GetCurrentDamageConfig`，`0x1826eb700`，按当前档位取得对应配置；已有证据在 `reverse_engineering/vampire-crawlers/native/`。
3. `ExecuteDamageEffect`，`0x1826e9010`，调用 `GenerateDamageParams`，`0x1826eb1c0`，计算 Amount、Area、DamagePerHit、Knockback、Pierce、FreezeStacks。
4. 将配置中的 `_weaponTargeting` 作为实际对象，进入 `WeaponTargeting.GetEnemiesToHit`，`0x18274d810`。它处理预览目标缓存、随机数快照，再调用实际 targeting 的 `CalculateEnemiesToHit`。
5. 对 Bible/Axe，继承 `CalculateEnemiesToHit`，`0x18274cc90`，从 `IEncounterModel.get_FrontEnemies` 取得前排并初始化模拟生命/护甲数据，接着进入 `ProcessColumns`，`0x18274e730`。
6. 生成目标、每发穿透数、各目标伤害与溅射数量，返回 `ExecuteDamageEffect` 后调用 `ApplyDamage`，`0x1826e7150`（复用旧证据）；随后 `FireWeapons`，`0x1826ea2e0`，负责武器展示。不能反过来仅用轨迹/粒子碰撞外观判定实际伤害范围。

圣经源配置 `sharedassets0.assets:31678`，对象 SHA-256 `db57d91bca43b64e65f8b0bafc6255c59be3192ac4e3cf8c24d5098ef77a436d`；斧头源位置及哈希见机器表。两者差异来自数值和方向配置：圣经 `FirstPersonDirection`；斧头 `SplineDirection`，并不改变上述 LeftRight 索敌对象。

## 每排五列，后排沿同列补位

`EnemyGroupModel.TryInit/Awake`，`0x182928a00`，检查并创建长度 **5** 的 `EnemyModel[]`。`RowMovementModel.get_FrontEnemies`，`0x18296c5d0`，返回当前前排组的该数组；实际队列是多个 EnemyGroup 构成的排/列结构。

目标模拟命中后，`OnSimulatedEnemyDied`（`0x18274e500`）调用 `TryMoveAliveEnemiesInColumnForward`（`0x182750b30`）：在后续 EnemyGroups 中沿相同 column 找到仍存活敌人，替换当前模拟前排该列；如果没有后续目标则清空该列。实际移动还存在 `RowMovementModel.MoveEnemyForward`（`0x18296b1c0`）。

所以后排不会一开始就与前排一起被所有攻击命中，但前敌被击杀后，同一张多发牌的后续命中可以接触补上来的敌人。将原型敌人简单压成一个数组、对所有活敌随机或全体处理，会丢失这条规则。

## 方向、每发命中与随机袋

- `LeftRightTargeting` 继承起点0与 `NextColumn=current+1`；`RightLeftTargeting` 起点max、`NextColumn=current-1`（`0x182744560`）。`TryWrapColumn`（`0x182751590`）越界回绕。
- `ProcessColumns` 外层以 Amount 限制发数，内层以有效 Pierce 限制当前发的主命中数量。每次命中或跳过后推进列指针，下一发清除当前发去重集合，但**不把列指针重置到首列**。
- `PierceType.OncePerEnemy=0`：同一发不重复命中同一实例；跨发可以重复。`MultiHit=1` 允许同一发重复命中。`MultiHitSwitchTarget=2` 还排除刚命中的同一目标。这里是横向遍历前排，不是直接穿过同列所有后排。
- `RandomTargeting.InitColumnBag`（`0x182743ee0`）每次计算目标时建立当前前排列号的 `Util.RandomBag<int>`，并启用自动补袋。`NextColumn`（`0x182744130`）与第一列方法从袋中取列；底层 `0x181248410` 明确随机选择索引、删除已抽项、袋空自动补满。它不是每次独立从所有活敌中均匀抽样；空列/不合格列也会消耗本次抽到的列号，再由外层跳过。
- `WhipTargeting` 的 `_goingLeft` 决定起点与步进（`0x18276c150`、`0x18276c160`）。构造是空方法、配置未设置该字段，基础状态为false，故左向右。没有发现自动翻转该字段的证据；鞭子视觉 `CenterOutDirection._alternateDirection=true` 不等于目标顺序左右交替。

## 魔杖优先攻击意图

MagicWand 与 HolyWand 的 `Priority=1`，对应 `TargetingPriority.Attacking`。`DoesEnemyMatchPriorityCheck`（`0x18274d2a0`）比较敌人当前意图动作的攻击类型；`RowHasRemainingPriorityEnemy`（`0x182750510`）排除当前发已命中的实例（OncePerEnemy）或刚命中的实例（MultiHitSwitchTarget）。尚有可用优先目标时跳过普通列；优先候选用完后回退到正常列扫描。不要把此模式改写成“最低血量优先”。

## 配置穿透与当前版本有效穿透的区别

`DamageEffect.GetEnemiesPiercedPerAmount`（`0x1826ed2f0`）只有在 DamageEffect、WeaponTargeting、WeaponDirection 的 `AllowsPierce` 都为true时直接返回配置中的 `pierce`。否则调用 targeting 的 `GetPierce`：

- 普通 WeaponTargeting fallback为1（`0x1807202f0`，机器码 `mov eax,1; ret`）。
- WhipTargeting 与 FrontRowTargeting 的 AllowsPierce=false，fallback为5（`0x180b17580`，`mov eax,5; ret`）。因此鞭子的配置pierce3并非当前有效值，它每发最多横扫五列。
- RuneTracerDirection 的 AllowsPierce=false（`0x1805f2a40`），所以其有效基础穿透为1。
- 斧头的普通 LeftRightTargeting + SplineDirection 满足允许条件，保留配置2；不是所有卡都被fallback1覆盖。

这些短方法与其他类共享地址，Ghidra自动选择的函数名可能显示无关类。判断依据是 `method-names.tsv` 的共享地址候选、元数据所属类与实际机器码；不能仅信自动命名标题。

## 当前支持的16张攻击牌

以下为基础档、无连击/属性/宝石修正；“每发上限”是有效主命中数，受可用敌人数量等约束，不是伤害倍数。

| 原型键 | 方向 | 基础发数 | 每击伤害 | 每发上限 | 额外限制 |
|---|---|---:|---:|---:|---|
| wand | 右→左 | 1 | 30 | 1 | 攻击意图优先 |
| knife | 右→左 | 5 | 8 | 1 | 同发去重 |
| whip | 左→右 | 1 | 8 | 5 | targeting固定5 |
| fire | 随机列袋 | 3 | 15 | 1 | 同发去重 |
| cat | 随机列袋 | 2 | 20 | 1 | 同发去重 |
| bible | 左→右 | 5 | 8 | 1 | 同发去重 |
| runetracer | 随机列袋 | 1 | 15 | 1 | direction禁穿透 |
| axe | 左→右 | 3 | 15 | 2 | 同发去重 |
| carrello | 右→左 | 3 | 15 | 5 | 同发去重 |
| celestial | 左→右 | 3 | 30 | 1 | 同发去重 |
| cross | 随机列袋 | 1 | 40 | 2 | MultiHit可重复 |
| lightning | 随机列袋 | 5 | 25 | 1 | 同发去重 |
| phiera | 左→右 | 5 | 25 | 1 | 同发去重 |
| holyWand | 右→左 | 8 | 20 | 1 | 攻击意图优先 |
| hellfire | 随机列袋 | 15 | 15 | 1 | 同发去重 |
| thousandEdge | 左→右 | 10 | 20 | 1 | 同发去重 |

这些卡 `_amountScalesWithCombo=true`、`_damageScalesWithCombo=false`，连击首先增加发数；基础 Area 均为0。

## Area 的确切含义与实现边界

普通 `ApplyAreaHits`（`0x18274b3c0`）仅在DamageParams.Area>0时执行，遍历当前 `enemyRow` 的存活目标，追加溅射命中；这里没有读取敌人3D位置或计算欧氏半径。`GetAreaDamage`（`0x18274d3a0`）为 `Area × 原始每击伤害 × Global.areaDamageMultiplier`；本构建该系数约0.2，`areaHitsAllPierceTargets=true`。主目标若主击后仍存活也在该遍历之内。

`_areaSizeCoefficient` 和武器展示尺寸不是上述逻辑范围的物理半径。原型目前16张牌基础Area0，可先忠实实现列扫描、有效Pierce、同发去重、随机袋、优先意图和死亡补位，不能凭视觉补一个虚构全屏AOE。

原版还有 FrontRowTargeting 整排流程、特殊爆炸、弹跳、暴击链、Overkill、虚拟目标和预览缓存。本轮未要求原型完整实现这些系统。若原型使用不同列数、较少后排、简化列袋或同帧动画，须标为实现适配；尤其不能把屏幕上所有敌人或全部后排视为“同一范围”。本轮是静态证据，不宣称已进行新增运行时逐击验证。
