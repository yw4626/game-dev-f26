# v10 属性与攻击附加效果：原生执行规则

证据目录 `evidence/effect-consumers-v10-native/`；原始 DLL/metadata 哈希、提取批次、反编译与汇编文件哈希由该目录 `manifest.cjs` 生成的 `manifest.json` 固定。使用既有 Ghidra 项目 `-readOnly -noanalysis`，未修改原游戏。方法名由原版 IL2CPP 元数据恢复；共享地址、尾调用与反编译参数错位要结合汇编和字段偏移检查。下面是静态执行证据，不宣称本轮新增运行时逐击验证。

## Area：标准化后产生前排小数溅射

`DamageEffect.GetArea` 0x1826eb640（复用 attack-patterns-v9-native）在不忽略 Area 时计算 `(baseArea + snapshot.Area) / 100`。常量100经 DLL VA0x183cc9858、fileoffset0x3cc8858、bytes0000c842确认。`GetAreaDamage` 0x18274d3a0 计算 `normalizedArea × originalDamage × Global.weaponConfig.areaDamageMultiplier`；资源系数0.2。因此 Area+5、基础Area0、原每击20的额外溅射是0.2，不能把5直接代入乘20再乘0.2，也不能每次自动向上取整成1。

普通 `ApplyAreaHits` 0x18274b3c0 与 `FrontRowTargeting.ApplyAreaHits` 0x182737010 均遍历当前前排全部仍存活目标，包含主击后尚存活的主目标；没有3D距离判断。普通函数中的主目标列比较只控制死亡处理，不是伤害排除。FrontRow override 也没有主目标排除分支。

`ApplyAreaHitToEnemy` 0x18274b360 → `ApplyResolvedDamageToEnemy` 0x18274bb50 → `ResolveArmorDamage` 0x182750210 使用 double，小数溅射先扣该目标护甲，再扣生命。最终 `EnemyModel.ResolveDamage` 0x18292b930 同样 double 扣甲/血，无逐次 Area ceil。显示数字可以格式化，内部伤害不能靠整数显示推断。暴击溅射与爆炸另有开关，不要把全部主击暴击倍率自动套给所有溅射。

## 击退：概率删除攻击动作

`DamageEffect.GetKnockback` 0x1826eda60 在 `_canKnockback=false` 时返回0。普通配置的基础 knockback 另加 Luck 相关项，但当前 Global.weaponConfig.luckKnockbackMultiplier=0，故本构建该项为0。

`WeaponTargeting.CanEnemyBeKnockedBack` 0x18274d180 要求当前意图含攻击类动作。`ProcessColumns` 0x18274e730 每发仅首个满足资格的目标可得到非零击退概率，计算 `(100-enemy.KnockbackResistance) × knockback / 100`。`DoesKnockbackRollSucceed` 0x18274d350 用随机[0,100)小于该值判成功。不是所有命中独立使用原始40，也不是“减少40%伤害”。

`DamageEffect.ApplyDamage` 0x1826e7150 调 `EnemyModel.OnKnockedBack` 0x18292af70：若当前意图全部是攻击动作，清空 currentIntent；若包含攻击和其他动作，复制意图并删除攻击动作，保留护甲等非攻击动作。怪物不会物理移到后排，也不能无条件删除混合意图全部动作。

## RemoveIntent 与 Soul Eater

`RemoveIntentEffect.OnExecuted` 0x18270f970 使用 IEncounterModel interface slot20 `get_FrontEnemies`（metadata method14115），不是全体后排。候选有当前意图，`_removeAllIntents=false` 时还按指定动作筛选；true 跳过动作筛选。候选多于 `_count` 时随机移除候选直至数量为 count。

SoulEater 的 `_removeAllIntents=true`、`_count=2` 表示最多选2名前排，不表示无限目标或自动全屏。count 未通过 GetComboAmount，不随连击增加。若指定 `_actionToRemove` 属于攻击类，仍执行 DisarmResistance 检查：随机[0,100)须不低于抗性。成功调用 `RemoveIntentDueToEffect` 0x18292b5c0，将当前意图整体清空。此效果与击退“仅删攻击动作”不同。

## 暴击、回血与 Max Health

普通 `ProcessColumns` 计算暴击 threshold=`(1+Luck/100) × critChance`，再由 `DoesCritRollSucceed` 0x18274d270 通过 CritChainState 检查；canCrit=false 时不应使用序列化 critChance 或 criticalEffects。CritChain 的特殊连锁状态另有0.98系数，不应在未接入该系统时虚构每次固定衰减。

元数据枚举 `DamageEffect.CritEffectType` 为 OncePerAttack、OncePerAmount、EveryCrit、None；`ApplyDamage` 的0/1/2/3分支分别对应这些模式。BloodyTear `_critEffectType=0`，因此一张攻击牌至多执行一次暴击效果 Heal2，不能每次暴击都回2。触发效果链固定传1且采用trigger语义，不再乘本张牌连击。

`HealEffect.OnExecuted` 0x182702c80 用 GetComboAmount 修正基础回血，然后执行 Arcana 分支、Health.AddValue。没有读取 Recovery。普通直接打出的 Heal 可按通用combo规则，暴击触发 Heal不再放大；生命上限由 Health SimpleStat 限制。

`MaxHealthEffect.OnExecuted` 0x18270a900 使用 GetComboAmount 后调用 Health.AddMax。`SimpleStat.AddMax` 0x182745540 只提高 max ObservableValue，不直接提高当前生命。不能把加生命上限默认写成同量治疗。

## Recovery：胜利后一次治疗

`RecoveryEffect.OnExecuted` 0x18270deb0 增加 Recovery 当前值，存在 Arcana.QuickRecover 分支；没有该奥术时并不立即治疗。全 DLL 对 `PlayerView.OnRecoveryConsumed` 的直接调用位于 `<PlayerModel.OnEncounterDefeated>d__280.MoveNext` 0x182971be0。

该胜利流程读取 Recovery 当前值R，R>0时先 `Health.AddValue(R,false)`，播放恢复显示，再继续战后重置。PlayerModel配置的 Recovery._resetAfterEncounter=true，故本场积累的恢复在战斗胜利后生效一次；不是每个回合治疗，也不是加在每个 HealEffect 上。失败流程不等于战斗胜利。

## Revival：100充能兑换一次，最多3次，复活至满血

`RevivalEffect.OnExecuted` 0x18266a5b0 将通用 GetComboAmount 的结果加到 RevivalCharge。`PlayerStats.OnRevivalChargeChanged` 0x182741030 在充能>=100且 RevivalStacks未到max时增加1次；充能减100并通过通知继续处理余额，到上限时充能清0。当前 PlayerConfig.baseRevival=0、maxRevival=3。

`PlayerModel.TryRevivePlayer` 0x182956d30 要求库存>=1，库存减1，Health设为ceil(maxHealth)，播放复活并发事件。原版有主动复活按钮流程；原型若自动在致死时触发，应标为交互适配。并非复活时恢复半血，也不是把Tirajisu的+10当成直接10条命。

## 冻结：本轮挡行动、受击消耗，回合末清除

`GetFreezeStacksPerHit` 0x1826ed690 在 ignoreCombo 时仅基础层数；否则只有 `_freezeStacksScaleWithCombo` 为true才乘combo。`GetNumberOfFreezeStacksSucceeded` 0x18274dcc0 按每一层分别掷概率；普通 `ApplyWeaponHitsToEnemy` 0x18274c680 使用 `1-FreezeResistance/100`。

`EnemyModel.Freeze` 0x18292a310（复用wild-acquisition-v10-native）将当前意图移入cached并清空当前意图；`EnemyEncounterModel.PerformIntents` 0x182924440 因currentIntent为空而跳过该敌人行动。带冻结层的目标受普通命中时由 ApplyDamage 调 DecrementFreeze；冻结伤害倍率当前配置2。

`EnemyModel.OnEndTurn` 0x18292adc0 调 `ResetFreeze(true,true,false)`；0x18292b640 将剩余层数全部清0并恢复cachedIntent。因此不能把冻结层数当跨回合剩余回合数。Orologion等卡的目标与每发层数仍由各自配置决定。

## 可直接复用的派生公式及未完成链

Phieraggi.GetAmount 0x18270cc60 先普通GetAmount得到A，再加 `min(cap, floor((100*RevivalStacks+RevivalCharge)*revivalScaling))`。本配置cap10、scaling0.01。Floor函数0x1805a8fa0的ROUNDSD9和软件路径均确认向下取整。

SongOfMana.GetDamagePerHit 0x1827118f0 先普通伤害D，再乘 `1+max(snapshot.Mana,CardConfig.GetManaCost())*_manaMultiplier`。Mannajja系数0.01。Mannajja还有生成临时牌的独立效果，不能只实现这个倍率即宣称成品完整。

LaBorra.OnExecuted 0x182708390 在普通伤害后逐个目标列调用 SantaWaterManagerModel.AddStack；ThunderLoop.OnExecuted 0x1827131f0 向 ThunderLoopManager.AddTargetColumns追加目标列。两者有 OnPlayerEndTurn消费者，不是纯即时额外伤害。已提取相关 manager、伤害/协程函数，但其专用资源与时序需要完整接入后才能启用。ValkyrieTurner也有 manager回调；不能只替换数值当作普通DamageEffect。

CoinEffect0x1826e5670先GetComboAmount，然后Player.AddCoins(useGreed=true)。GetGreedCoins0x182949b20为 `ceil(coins*(1+Greed/100))`。证据支持Greed作用于CoinEffect，不代表已复原全部金币获取来源。

## Heaven Sword 弹跳可接入规则

`tracker-configs.json` 保存本机 `sharedassets0.assets:31316` 的 BouncyConfig_HeavenSword：baseChance20、chanceDecayPerBounce约0.8、maxBounces100。`GetBounceChance` 0x18274d430 与 `GetBounceCount` 0x18274d560 采用 `p(n)=baseChance/100 × (1+Luck/100) × decay^n`，n从0，随机失败立即停止，成功则继续直到最大100。pow的第二参数n由汇编CVTDQ2PS确认，不能把反编译漏出的参数当作不存在。

`ProcessColumns` 每发开始调用 GetBounceCount，给该发主命中上限增加 `effectivePierce+bounceCount`。仍使用该牌原有列扫描和去重策略；HeavenSword是Random/MultiHit，允许重复目标。不是把整个发数再乘弹跳数，也不是打完后随机补一个整排AOE。`BouncyEffect.OnExecuted` 是空方法，标记的config在索敌时消费。

## Vicious Hunger 与回合末管理器的进一步边界

`ViciousHungerDamageBehaviour.OnExecuted` 0x182719130 对命中且未已有相应VFX标记的敌人调用 EnemyView.RegisterDeathMark，并启用粒子；`OnEnemyDied` 0x182718d00 后续处理钱币。这不是必须由本次主伤害最后一击击杀才有资格。

其随机是静态自动补袋 `[0, .01, ... .99]`；抽r后成功条件为 `r × (1+(LuckMultiplier-1)×clamp(luckScaling,0,1)) > 1-coinChance/100`。本资源coinChance10、luckScaling0.1、coinAmount10。在Luck0时，严格大于0.9的离散袋值共有9个，不能替换为独立10%随机再声称一致。成功生成 `ceil(coinAmount×(1+Greed/100))` 枚金币；注册持续时间、跨牌死亡标记替换、金币拾取时点需要和view生命周期共同接入。尚未完成这些链时应维持灰态。

tracker资源还确证：LaBorra使用 level3:22347 的 SantaWaterManagerModel，引用 sharedassets0:31712 和 sharedassets3:19958 DamageConfig_LaBorra（基础回合末伤害30）。SantaWater另有独立manager与回合末配置；不能将两者共用一个未区分的毒伤数组。LaBorra按列AddStack，OnPlayerEndTurn逐列处理累计stack，SantaEndTurnDamageEffect0x182710a50读取本回合结束时Might/Area，主伤害按 `(int)((1+Might/100)×baseDamage×stacks)` 构造，非重新执行当前手牌连击。

ThunderLoopManager level3:23892 引用 sharedassets0:31714 的成品牌。OnPlayerEndTurn收集命中列，然后清除列表；ResolveModelDamage0x1826a0bd0读取成品的 BaseUpgradeConfig（非原打出牌宝石/临时倍率），按 `ceil(baseDamage×(1+Might/100))` 对这些列的当前前排目标补击，并处理冻结/Area。源文件提供了模型链，但动画协程、击杀补位及多列重复命中的完整一致性仍须专门测试；没有该管理器时成品应灰态，不静默丢弃延迟伤害。
