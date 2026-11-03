# Area伤害与前后排：v13原生证据复核

2026-10-29。本轮重新读取已保存的C反编译与ASM，沿调用者、参数列表和模拟死亡流程复核；另从原游戏资源重新只读读取GlobalConfig原始字节。没有运行原游戏录制伤害，没有修改原游戏，没有新开Ghidra分析。目标GameAssembly.dll SHA256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。

## 已确认结论

原版的0.2是Area伤害公式中的系数，**不是后排固定受到主伤害20%**。普通Area额外伤害为：

```js
const area = ignoreArea ? 0 : Math.fround(Math.fround(baseArea + snapshotArea) / 100);
const splash = area > 0 ? area * originalDamage * Math.fround(0.2) : 0;
```

没有`1 + Area/100`的保底项，没有至少1点伤害，没有对普通Area伤害向上取整。函数本身没有按后排深度衰减的系数。

当前已追踪的普通索敌、FrontRowTargeting和Runetracer动态碰撞路径，Area对象均来自前排列表；**没有找到对所有未顶上来的后排进行额外溅射的代码**。后排可以在前排死亡、进入模拟前排后，被同一次出牌的后续命中或后续Area命中。不能把这种情况写成“后排固定20%溅射”。

| 基础Area + 玩家Area | 归一化Area | 普通Area伤害相对主伤害 | 主伤害20时的额外伤害（便于阅读的近似值） |
|---:|---:|---:|---:|
| 0 | 0 | 0% | 0 |
| 5 | 0.05 | 1% | 0.2 |
| 10 | 0.1 | 2% | 0.4 |
| 20 | 0.2 | 4% | 0.8 |
| 50 | 0.5 | 10% | 2 |
| 100 | 1 | 20% | 4 |

精确浮点样例保存在[evidence-links.json](evidence/area-v13/evidence-links.json)。例如Area5、主伤害20得到`0.20000000596046452`，不是整数1。

## 系数、精度与开关的直接证据

- `DamageEffect.GetArea`，`0x1826eb640`：ASM先调用ignoreArea虚函数；为真则返回0。否则`ADDSS`相加基础Area和snapshot.Area，`DIVSS`除以地址`0x183cc9858`的float100。这是float32归一化。
- `WeaponTargeting.GetAreaDamage`，`0x18274d3a0`：ASM在`0x18274d3e1`从GlobalConfig实例`+0x57c`读取float系数，`CVTSS2SD`把Area转换为double，再连续两次`MULSD`。返回double乘积，没有round/ceil。
- 本轮从原游戏`globalgamemanagers.assets:7720`重新读取原始MonoBehaviour字节。对象SHA256为`2487f88bb55f9e72567c0b8c1ac25a9754aa2c3a6a078f47f1f4b9c3dadaa9fe`；weaponConfig字段序列在对象偏移2264唯一匹配，Area系数在偏移2284，字节`cd cc 4c 3e`，即float32 `0.20000000298023224`。紧随其后`areaHitsAllPierceTargets=true`。见[global-area-bytes.json](evidence/area-v13/global-area-bytes.json)与复核脚本[read-global.py](evidence/area-v13/read-global.py)。
- `areaHitsAllPierceTargets=true`表示同一轮的每个穿透主命中都可触发Area遍历，不是“Area会命中所有后排”。`ProcessColumns`在`+0x580`读取这个开关；关掉时检查该轮已处理的命中计数，只让第一个穿透命中触发。
- `ApplyAreaHitToEnemy`，`0x18274b360`，在存在Area暴击标记时只乘critMultiplier；这里同样没有整数取整。普通Area独立暴击尝试受到`WeaponTargeting._roaringActive`（`+0x34`）门控，不能等同于卡牌普通`canCrit`。本文不把尚未完整追踪的Roaring/暴击爆炸联动扩展为一般规则。

## 前排来源与结算顺序

普通索敌路径：

1. `CalculateEnemiesToHit`，`0x18274cc90`，调用`IEncounterModel`接口槽`0x14/20`。现有元数据明确该槽是`get_FrontEnemies`，不是全体Enemies。
2. `InitialiseLists`，`0x18274df30`，将该列表逐列复制到临时`enemyRow`，同时建立对应生命、护甲和冰冻的模拟数据。复制时没有遍历后排。
3. `ProcessColumns`，`0x18274e730`，将同一个可变`enemyRow`传给主击和`ApplyAreaHits`。每次先结算主击并更新模拟生命，再执行Area。
4. `ApplyAreaHits`，`0x18274b3c0`，在Area大于0时遍历`enemyRow`，对模拟生命大于0的对象追加Area命中。没有3D半径检查；没有排除仍存活的主目标。因此主目标存活时也会得到本次Area追加伤害。
5. 普通主目标所在列的模拟死亡推进在本次Area之后处理：`ProcessColumns`末端调用`OnSimulatedEnemyDied`，`0x18274e500`，进而调用`TryMoveAliveEnemiesInColumnForward`，`0x182750b30`。
6. Area遍历中，除本次主目标列外，Area杀死的其他列会通过`TryHandleSimulatedDeath`，`0x182750950`，立即调用同样的模拟推进。该列新顶上的敌人不会被同一个for循环在该列再打一次，但可能被后续主命中及其Area遍历命中。

由此，普通主击杀死前排A时，这次Area不会直接打到A后面的B；B在该次Area结束后顶上。后续主击/投射可打B，这与“所有后排在每次攻击时自动受溅射”不同。

`FrontRowTargeting.ProcessColumns`（`0x182737620`）使用相同初始化来源；每次主击后调用自身`ApplyAreaHits`（`0x182737010`），仍遍历这份前排派生列表。该override的普通循环没有普通`OnSimulatedEnemyDied`推进调用，不应从普通索敌直接推断为其添加同轮推进。暴击爆炸等额外联动不在这个无暴击分支结论内。

## Runetracer / 爆裂的差异

`RunetracerCollision.DoViewDamage`，`0x1826ca340`，处理运行时动态碰撞。它首先对主目标执行`GetDamageToDo`，因冰冻得到放大伤害时，这个**已经放大的值**继续传入`DoAreaDamage`（`0x1826c9fc0`）。普通预计算索敌的Area则从DamageParams.DamagePerHit读原始主伤害；两条路径不应混写。

`DoAreaDamage`先调用同一个`GetAreaDamage`，然后当场重新读取`IEncounterModel.get_FrontEnemies`并逐个`ResolveDamage`。它没有后排枚举、没有距离过滤，也没有逐个再次调用`GetDamageToDo`消耗Area目标的冰冻。因此，动态主击冰冻可提高这一整次Area的基础值，但不能对每个Area目标再次翻倍、再次扣冰冻。

该运行时路径在主击`ResolveDamage`之后获取前排；是否已发生真实队列的推进，还取决于敌人死亡和视图移除时序。这个函数本身只能证明“结算Area时的当前前排”，不能承诺与普通预计算推进时点完全相同。

爆裂的**碰边爆炸**属于另一条独立路径：`NoFutureProjectile.ResolveExplosionDamage`只找最近的可受击前排，使用单独float32 0.2系数，并作银行家取整；它没有Area遍历。不可与本文不取整的Area伤害混为一谈。

## 对原型的实施边界

可直接按原版替换的是Area公式、float精度、ignoreArea、Area0无追加伤害、没有强制最小整数，以及普通Area的前排来源。若继续保留用户指定的“前排全额、未顶上的后排溅射”玩法，应明确标记为原型规则；只能说其数值公式借用了已确认的Area系数，不能称已还原原版后排规则。

复用证据文件与SHA256、方法元数据和接口槽映射均汇总于[evidence-links.json](evidence/area-v13/evidence-links.json)。

## v0.13 实装

引擎已替换临时全后排20%规则，使用上述float32归一化与系数，保留小数伤害和独立护甲。普通主击使用命中前前排列表结算Area，避免同次击杀后立即误伤本列替补；FrontRowTargeting在一次伤害效果的所有轮次固定起始前排身份。符文动态碰撞则在主击后重新获取前排，原型采用即时补位；原版视图死亡时序仍未运行验证。尚未完整追踪的Roaring额外联动未实装。

卡牌预览、中英文说明、溅射动画数字和开发者系数面板同步更新；页面将v10–12存档迁移到v13，不重置现有手牌或生命。显式v12测试保留历史规则，默认新局使用v13。
