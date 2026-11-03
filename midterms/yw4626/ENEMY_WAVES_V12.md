# 多排敌人与逐列补位（v12）

本轮读取的是原版 `GameAssembly.dll` 和已经提取的 Unity 序列化配置，不是运行时录像验证。DLL SHA-256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。

## 原生证据

| 结论 | 依据 |
|---|---|
| 一排固定五列，存在多排敌人组 | `EnemyGroupModel.TryAddEnemyModel` [0x182929230](evidence/special-effects-v12/0x182929230.c) 创建/校验长度为 5 的 EnemyModel 数组；`RowMovementModel.get_FrontEnemies` [0x18296c5d0](evidence/special-effects-v12/0x18296c5d0.c) 只返回当前最前组的数组。 |
| 补位按同一列逐个向前，不需要等待整排被消灭 | `EnemyDespawned` [0x18296ab80](evidence/special-effects-v12/0x18296ab80.c) 找到该敌人所在列、移除后沿该列找后续实体；`MoveEnemyForward` [0x18296b1c0](evidence/special-effects-v12/0x18296b1c0.c) 递归移位，`MoveEnemiesForward` [0x18296b090](evidence/special-effects-v12/0x18296b090.c) 遍历五列空位。 |
| 攻击目标模拟也会补位，因此同一张多发牌能继续打到后来顶上的敌人 | 既有 [ATTACK_PATTERNS_NATIVE.md](ATTACK_PATTERNS_NATIVE.md) 的 `OnSimulatedEnemyDied` 0x18274e500 / `TryMoveAliveEnemiesInColumnForward` 0x182750b30。普通横向穿透不能直接穿过存活前排去打整列后排。 |
| 每轮重新决定意图时只遍历前排 | `EnemyEncounterModel.DecideIntents` [0x182921e90](evidence/special-effects-v12/0x182921e90.c) 直接调用 `get_FrontEnemies` 后决定每个敌人意图。不能给所有后排预先滚动意图并让它们一齐攻击。 |
| 模型补位和画面补位分别处理 | `EncounterRowsView.UpdateEnemyRows` [0x1827e20f0](evidence/special-effects-v12/0x1827e20f0.c) 检查五列可见空位，调用 `EnemyGroupView.JumpEnemyToRow`，按同列连续移动的数量累加动画延迟；不是把后排横向挤到前排旁边。 |

原生数组中的排索引朝向与网页原型相反。原型约定 `slot.row=0` 为前排，增大表示更深；这是索引适配，不是修改同列补位规则。

补位后意图的精确时机尚有边界：本轮补查 `TryAddEnemyModel`、`OnEnemyAddedToGroup`、`RegisterEnemy` 和 `EnemyEncounterView.AddEnemy`，直接路径没有找到补位瞬间调用 `DecideIntent`；`AddedToGroup` 的所有间接订阅者没有穷尽。网页原型在敌人成为前排时生成可见意图，并允许它参加随后敌人回合，避免出现无说明的空白行动。**这是明确的时机适配，不宣称已逐帧验证为原版时机。** 后排在等待时不消耗意图 RNG；前排冻结或被缴械不会因为别列补位而重新获得意图。

## 已提取的原版显示参数

来源：[levels-v7-config/configs.json](evidence/levels-v7-config/configs.json) 中 `GlobalConfig`、`globalgamemanagers.assets:7720`、`fields.enemySettingsConfig`。该对象 SHA-256：`2487f88bb55f9e72567c0b8c1ac25a9754aa2c3a6a078f47f1f4b9c3dadaa9fe`。

| 参数 | 原值 |
|---|---:|
| rowWidth | 7 |
| rowZSpacing | 2.25 |
| rowYSpacing | 0 |
| rowChangeJumpPower | 0.3 |
| rowChangeJumpDuration | 0.2 秒 |
| jumpDelayPerEnemy | 0.2 秒 |
| rowBufferCount | 5 |
| spawnAdvanceDelay | 0 |

这些是 Unity 场景单位与动画参数，不是 CSS 像素值。网页采用透视缩小、后排偏高、仅前排显示完整数值，以及补位动画来表达深度。`rowBufferCount=5` 不能解释为所有原版战斗最多五波；它只是该配置中的缓冲参数。

## 原型队列数量与平衡

以下数量来自本项目的五层难度适配，**不是提取到的原版每关敌人生成表**。`dist/encounters.js` 在 `rulesVersion:12` 时启用。

| 楼层 | 普通战（开头 / 后段） | 精英战 | Boss 战 |
|---|---:|---:|---:|
| 1 | 9 / 12 | 12 | 20 |
| 2 | 12 / 16 | 16 | 20 |
| 3 | 20 / 25 | 25 | 25 |
| 4 | 20 / 25 | 25 | 25 |
| 5 | 25 / 30 | 30 | 30 |

- 第一层普通战占用第 0、2、4 列；第二层占用第 0、1、3、4 列；第三层起占满五列。每列拥有连续的后备队列。
- Boss 从一开始就在中央前排，与两侧四个小怪同时可见，后方还有多排小怪。Boss 约占原总生命的 52%，其余小怪共享剩余生命。
- 保留此前一场遭遇的总生命、总经验和初始 Boss 护甲预算。更多怪物不会各自重复获得整份经验；单体经验可能为 0。
- 攻击威胁按列分配，同列后续怪物使用该列的攻击值。任何时刻最多五名前排行动，一轮最大攻击总值不超过旧遭遇预算；不能把攻击值均摊到三十只怪物后让大部分怪物只造成 0 伤害。
- 护甲意图的数值继续在整场敌人间分配。视觉变种仍使用已提取的三类基础 AI，不能将不同像素外形称为新的原版 AI。

旧规则（`rulesVersion:9`）仍返回旧的 3–5 只敌人配置；读档不会用新生成器重建正在进行的战斗。新战斗由 Run 的版本开关明确启用队列配置。

## 验证范围

[tests/enemy-waves-v12.test.cjs](tests/enemy-waves-v12.test.cjs) 的 12 项测试覆盖五层队列、同列独立前排、Boss 位置、预算、后备意图、补位事件、重复击杀保护、多发牌继续命中、最后敌人死亡才胜利、敌人回合中途读档、经验只结算一次和旧战斗迁移。另有玫瑰念珠测试：先固定待清除的原始排，死亡补位不会让刚补上的下一排被反复清除；两排效果遇到抗即死 Boss 时也不会对 Boss 重复套用。

[simulate.cjs](evidence/enemy-waves-v12/simulate.cjs) 使用既有五层路线测试的正常策略（收集成长物、商店购买、休息、正常出牌及选择奖励），仅更换版本与种子，没有注入生命、法力或卡牌。两个角色 × 两个配置 × 三个种子共 12 次完整五层行程均通关，详见 [simulation-results.json](evidence/enemy-waves-v12/simulation-results.json)：

- 基础配置：33–46 回合，结束生命 60–81。
- 演示配置：17–29 回合，结束生命 71–85。
- 每局击败 228–241 只敌人，进行 11–12 场遭遇、领取四次层末奖励、完成 18–24 次存档往返；Boss 实际执行了 4–14 次行动。

这验证流程可完成且没有出现队列软锁，不代表新手玩家胜率或原版难度。旧 `combat-v9.test.cjs` 的 13 项也在本轮独立通过。

仍需区分：静态原生证据证明队列和显示流程；原型的具体怪物数、生命拆分、二维透视尺寸是适配。不能将这些适配数值报告为原版精确数值。

范围伤害的最终版本复测也完成12次通关，所有击杀总计与实际生成敌人数一致。此策略不是人类难度评估；范围行为按用户指定的前排全伤/后排溅射实现。
