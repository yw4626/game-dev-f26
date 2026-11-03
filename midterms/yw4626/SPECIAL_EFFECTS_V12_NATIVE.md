# 进化武器特殊结算补查（2026-10-29）

目标为本机 Vampire Crawlers 的 Unity IL2CPP 构建，GameAssembly.dll SHA256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。本次复用现有 Ghidra 项目，以 `-readOnly -noanalysis` 定点导出；没有运行、注入或修改原版游戏。以下是静态代码与序列化资源证据，不能称为原版运行实测。

后续实现覆盖说明：用户进一步指定“范围攻击前排全伤、后排只受溅射”。v12因此对范围目标和Area溅射采用明确的用户规则适配，详见 `IMPLEMENTATION_V12.md`；原生对Area/targeting的发现保留在下文作为证据，不代表网页仍照搬所有该分支。后排默认20%与圣经系列范围化为原型设定。碰边爆炸的最近前排选择、独立伤害系数及冻结消费没有混入这项范围修改。

## 爆裂：不止一次主击，也不只是爆炸动画

原版 No Future 卡牌的基础值仍是3费、15伤害、1发。其武器 `sharedassets0.assets:34578` 的同一根物体上有 `RunetracerCollision:33571`、`Projectile:38325`、`LinearMovement:38895`、`NoFutureProjectile:39621`。其中两条额外结算路径不经过普通一次性投射物逻辑。

1. `RunetracerCollision.OnSpawned`（0x1826ca970）记录 `Weapon.DamageParams.DamagePerHit`，初始化每列的 `_hasCollidedWithEnemiesThisBounce` 标记。
2. 普通轨迹碰撞先处理已安排的目标（`CollisionDetectionUpdate`，0x1826c99f0），随后 `ViewCollisionDetectionUpdate`（0x1826cb0c0）检查实际当前前排和弹体距离，补充未安排的碰撞。已经处理过的列在这次弹射中不会重复命中。
3. `OnCollisionWithTarget`（0x1826ca6a0）和 `OnViewCollision`（0x1826cacb0）将该列标记设为true；后者调用 `DoViewDamage`（0x1826ca340），对这一列**当前前排**造成完整每击伤害。冻结增伤与消耗、合法的Area溅射仍适用。
4. `OnViewportCollision`（0x1826cad20）将所有列标记重置为false，因此碰边后可以再次击中同列。碰到普通敌人时没有调用Projectile.TryDeactivate。不能把有效通用pierce=1解释为整段飞行仅造成一次命中。
5. 独立的 `NoFutureProjectile.Awake`（复用v10，0x1826b8200）订阅同一个碰边事件，产生下面的爆炸附加伤害。

`LinearMovement.TickMovement`（v10，0x1826b6f60）分别检查水平与垂直边界：位置越过对应margin、且方向正朝外才反射。两项是独立if，角落同一次更新可能产生两次事件。`ShouldChangeDirectionOnBounce` 在本类型共享的0x1805f90f0返回true。

## 碰边爆炸的真实伤害

- **实际prefab系数为float32的0.2**（0.20000000298023224），不是构造器默认的0.5。`NoFutureProjectile.OnSpawned`（v10，0x1826b8720）的汇编将该float转换为double，乘武器每击伤害，再作银行家舍入（ties-to-even），保存int爆炸伤害。公式为 `roundEven(double(float32(0.2)) * DamagePerHit)`。基础15得到3；12.5乘实际float系数略大于2.5，得到3，不能先把系数简化为精确0.2再错误舍入为2。
- `CreateExplosion`（v10，0x1826b8290）保存**发生碰边时的位置**、爆炸伤害和武器，计划在 `Time.time + float32(0.1)` 处理。
- 新导出的 `<ProcessPendingDamage>d__14.MoveNext`（0x1826c47b0）按队列检查到期时间并出队；场景/当前遭遇无效时清队列。它不是每次主击直接同步再打一遍，也不能在主击后提前判胜而漏掉已排入的有效爆炸。
- 队列是静态队列；NoFutureProjectile没有OnDisable/OnDespawn/OnDestroy取消消费者。处理器未用Projectile寿命过滤，Unity对象判空也不等于GameObject已禁用。已排入的爆炸可在弹体停止移动后到期结算；不要按maxLifeTime截掉最后0.1秒尚未到期的爆炸。
- `ResolveExplosionDamage`（v10，0x1826b89c0）从 `IEncounterModel.get_FrontEnemies` 取得当前前排。这里通过接口slot0x14调用；元数据中IEncounterModel的第20个方法正是get_FrontEnemies，不能因为循环内部没有row检查就误判为可攻击所有后排。
- 对非空、IsTargetable的前排，按爆炸位置与敌人Transform位置的**三维距离平方**挑选最小的一个；使用严格小于比较，同距离保留先遍历的列。没有半径筛选，也没有遍历全体目标并全部造成爆炸伤害。
- 对选中者调用 `EnemyModel.GetDamageToDo(baseExplosion,false)`（0x18292a570），如果目标冻结，伤害乘全局冻结倍率后向上取整；现有资源倍率为2。再调用 `DecrementFreeze(1,false)`，然后 `EnemyModel.ResolveDamage`（0x18292b930）按正常护甲/生命规则扣除，并带入源卡与伤害统计。
- 这条爆炸路径**没有暴击判定、暴击回血或Area溅射调用**。NoFuture的 `_canCrit=false`；资源里残留的0.8暴击率与回血3不能误启用。

因此卡牌说明应表达“飞行碰撞可重复命中；每次碰边延迟爆炸，对最近前排额外造成每击伤害20%（舍入）”，基础15×1应标作每击×发数，而不是完整总伤害。完整总量取决于飞行轨迹、存活目标、冻结、护甲和碰边次数。

## 飞行寿命、速度与基础痕印石

`Projectile.OnSpawned`（0x1826bdef0）计算 `speedMultiplier = 1 + amountSpeedCoefficient * (DamageParams.Amount / baseAmount - 1)`；`FixedUpdate`（0x1826bdc80）用当前速度乘该系数推进，再按acceleration更新速度。两张牌的amountSpeedCoefficient均来自DamageEffect配置，当前为float32的0.1。

| 参数 | 痕印石 Runetracer | 爆裂 No Future |
|---|---:|---:|
| Weapon | sharedassets0:34592 | sharedassets0:34578 |
| RunetracerCollision | 33572 | 33571 |
| Projectile | 38338 | 38325 |
| 基础速度 | 20 | 30 |
| 最短离屏检查时间 | 0.5秒 | 0.5秒 |
| 最长活动寿命 | 1.5秒 | 2.5秒 |
| 失活后表现等待 | 0.3秒 | 0秒 |
| 碰撞半径 | 0.2×Weapon.AreaSize | 0.2×Weapon.AreaSize |
| 屏幕margin | 约0.02 | 约0.02 |
| 碰边反射 | 有 | 有 |
| 碰边额外爆炸 | 无 | 有 |

`Projectile.Update`（0x1826be630）在超过maxLifeTime时失活；开启deactivateOffScreen且超过minLifeTime、renderer不可见时也失活。`TryDeactivate`（0x1826be2b0）按stopMovingOnDeactivate把当前速度清0。minLifeTime不是普通命中后必活0.5秒的承诺，也不是固定爆炸间隔。

`DamageEffect.InitWeaponAreaSize`（0x1826ee540/0x1826ee5e0）计算 `clamp(1 + normalizedArea * areaSizeCoefficient, minMaxAreaSize.x, minMaxAreaSize.y)`。原版Global.weaponConfig的minMaxAreaSize为0.1到10，两个符文类武器的coefficient为0.5；normalizedArea为 `(baseArea + snapshot.Area)/100`。根组件的碰撞半径乘这个尺寸；爆炸视觉尺寸也使用它，但爆炸目标算法仍是最近一个前排，没有径向AOE。Global中另有maxExplosionTriggersPerCast=50，当前NoFuture创建/队列/结算路径并不读该字段，不能擅自套用为这条路径的次数限制。

`RuneTracerDirection.GetWeaponOrigin`（0x182744570）会抽取四个边之一、方向符号和20–50度角，并经原版Camera WorldToViewport/ViewportToWorld转换构造起点。浏览器没有相同的Unity Camera/敌人碰撞体，因而需要明确的固定逻辑空间适配，不能把某个浏览器窗口宽高直接用于战斗数值。采用确定性2D轨迹、记录碰边事件、按事件时间排序结算，属于可复核的原型适配；**精确原版碰边次数、原始物理碰撞点和完整单卡总伤害仍需原版运行采样校准**。从首个目标处开始的轨迹也是适配，并非原版屏幕外起点已复原。

## 其他已启用进化牌的检查

本次 `extract-prefabs.py` 从原版卡牌引用追到19个进化武器根物体及其子物体，并额外检查基础痕印石。库存存于 `evidence/special-effects-v12/prefab-inventory.json`，每个对象带源路径、path_id、SHA256。四个碰撞组件的完整TypeTree解析存在剩余字节，保留了明确错误和原始hex；类型身份仍由MonoScript确定，但不声称这四个组件全部序列化字段已解码。跨prefab再生成的二级资源以及未启用牌管理器，仍沿用已有v10审计边界。

| 已启用牌 | 专用组件/检查链 | 结论和必须展示的机制 |
|---|---|---|
| 血笞 | AnimatedWeaponManual、ManualCollision；0x1826d4e70触发已安排的全部碰撞伤害 | 暴击25%×2；暴击回血2的OncePerAttack门控必须保留，不可按每击/连击重复回血。动画伤害时刻0.25不表示额外伤害。 |
| 神授魔杖 | 通用ProjectileCollision/LinearMovement | 8发、攻击意图优先；本次根层级没有发现独立的额外伤害消费者。 |
| 渎神祷书 | KingBibleProjectile与通用ProjectileCollision；0x1826d1850等待2帧后启用碰撞并播放粒子 | 连续命中与40击退参数；此专用类不制造第二套伤害，不能因为粒子存在就另加全屏伤害。 |
| 死亡旋风 | DeathSpiralProjectile.OnSpawned，0x1826b2780 | 改变生成位置/方向，随后初始化原有移动与碰撞；前排穿透、25%×2暴击来自DamageEffect/targeting。没有发现独立额外爆炸调用。 |
| 天堂之剑 | BoomerangMovement、HeavenSwordRotationController；0x1826affc0按已安排目标进入下次弹射/回收阶段 | 随机、可重复命中，50%×2.5暴击；BouncyConfig增加每发命中上限，不是把全部伤害再乘弹射数。归返动画不自动额外打一排。 |
| 地狱火 | 通用ProjectileCollision/LinearMovement | 15发、击退40；canCrit=false，不能启用残留暴击字段。 |
| 爆裂 | RunetracerCollision + NoFutureProjectile | 本次确认飞行碰撞重命中与碰边额外爆炸均漏结算；见上述路径。 |
| 噬魂纹章 | TimedCollision；0x1826f3ac0在collisionWait后执行已有伤害，当前wait=0 | 前排伤害；连击加每击伤害、治疗2×连击；`_removeAllIntents=true`，尝试移除最多2名前排敌人的全部意图并受抵抗影响，数量不再乘连击。 |
| 千刃 | 通用ProjectileCollision/LinearMovement | 10发、50%×2暴击；本次层级没有发现第二套专用伤害消费者。 |
| 菲拉吉 | PhieraggiWeapon.SetSpawnPosition，0x1826b8fb0；专用继承的动画发射器 | 布置水平/垂直发射点；复活充能额外发数来自PhieraggiEffect.GetAmount，先普通连击发数再加 `min(10,floor((100*层数+充能)*0.01))`。位置计数24/8/16不能当作额外伤害发数。 |

“未发现”仅限本次所列prefab层级及已导出消费者，不是全游戏无其他交互的证明。已有通用伤害与宝石、人物触发、CritChain精确随机序列的适配边界仍然存在。

## 同时发现：普通暴击的舍入顺序遗漏

`WeaponTargeting.ApplyWeaponHitsToEnemy`（v10，0x18274c680）先调用 `EnemyModel.GetDamageToDo`，然后调用 `WeaponTargeting.GetEnemyDamage`（新导出0x18274db20）。后者对 `damage * (isCrit ? floatCritMultiplier : 1)` 使用银行家舍入。

正确顺序：冻结时先 `ceil(baseDamage * frozenMultiplier)`，随后暴击倍率并 `roundEven`，最后扣护甲/生命。未冻结时不需要先ceil。天堂之剑基础5点的×2.5暴击结果应为12，不是12.5；若冻结则先得10，再暴击得25。通用Area溅射保留double，不能跟着改成每次整数舍入。

## 仍未启用的9张

7张尚未完成特殊消费者的牌保持禁用：华月纹章（充能、抹除、额外经验）、瓦尔基里喷枪（专用持续投射物）、饕恶魔眼（标记死亡后产金币）、圣徒精华（按列水池与回合末伤害）、雷环（命中列与回合末追加攻击）、摧锋（武器内部发射）、黑乐谱（法力相关伤害与临时牌）。涤罪/无尽回廊在这个构建的资源明确NOT USED，另列禁用。不能把它们当作只有基础伤害的正常成品加入奖励。

详细旧证据见 `EFFECT_CONSUMERS_V10_NATIVE.md`、`EVOLUTION_V10_CONFIG_EVIDENCE.md`。本次没有静默开放这些不完整成品。

## 复核材料

- `evidence/special-effects-v12/run*.ps1`、`targets*.txt`、`script*.log`：五批只读定点导出。
- 同目录 `0x*.c` 和 `0x*.asm`：具体方法与指令。`status.tsv`为最后一批，前四批成功记录保存在各自script日志。
- `extract-prefabs.py`、`prefab-inventory.json`：实际Unity引用与组件哈希。
- `metadata-links.json`：接口slot、RunetracerCollision字段身份、所有目标方法候选及地址。
- 上述NoFuture已有十个方法和原始NoFutureExplosion资源继续引用 `evidence/evolution-audit-v10/`，避免重复复制证据。
