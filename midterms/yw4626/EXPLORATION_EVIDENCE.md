> 历史记录：本文件描述v0.3。v0.4的生成地图、物件与铲子新证据见 EXPLORATION_SYSTEMS_EVIDENCE.md 和 MAP_CONFIG_EVIDENCE.md。

# 第一人称探索：原版静态证据与原型边界

日期：2026-10-28。此次调查不启动原游戏、不注入运行时、不修改安装文件。复用已有 Ghidra 工程，以 `-readOnly -noanalysis` 定点反编译17个函数；项目日志明确记录丢弃只读分析产生的数据库更改。下文是静态代码与元数据观察，不能冒充原版运行时实测。

## 目标与可追溯来源

- 二进制：`D:\steam_data\steamapps\common\Vampire Crawlers\GameAssembly.dll`，88,280,576字节，SHA-256 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。
- IL2CPP元数据：`Vampire Crawlers_Data\il2cpp_data\Metadata\global-metadata.dat`，SHA-256 `319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。
- 已有REA元数据证据：`ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35`，位于工作区 `reverse_engineering/vampire-crawlers/initial-evidence.json`。
- 本次依据以上元数据恢复字段偏移；`evidence/exploration/inspect-fields.cjs` 重新计算当前磁盘二进制及元数据哈希，均与已有证据相同才继续。
- 函数来源名取自已有 `method-names.tsv`；本次导出的 `.c`、`.asm`、目标清单和日志均保存于 [evidence/exploration](evidence/exploration/)。字段报告为 [field-offsets.json](evidence/exploration/field-offsets.json)。反编译的 `FUN_` 名、共享泛型方法和间接调用存在恢复局限。

## 已确认的静态规则

| 问题 | 静态观察与实现意义 | 代码证据 |
|---|---|---|
| 地图结构 | 玩家位置是 `Vector2Int`；格子含 `Connections`、`ValidExits`、`IsFloorExit`、`IsEventCleared`、`ContainsAmbush`。邻接枚举有North/East/South/West，适合四向逐格移动，而非抽象单向节点链。 | 字段报告：类型2265 `Dungeon3DMapModel`、2113 `MapTile`、259 `GridNeighbour` |
| 能否移动 | 先检查 `_isMovementLocked`；当前格的Connections需包含所选方向，地图还需能取得该方向的邻格。无合法连接就返回false。 | [CanMoveInDirection 0x1828ea870](evidence/exploration/0x1828ea870.c) |
| 执行移动 | 校验连接与邻格，调用视图移动，再更新 `_playerMapCoords` 并发送 `PlayerMoved`。特定格子情况下还会保存；不能从这一个函数推出“每步无条件存档”。 | [TryMoveInDirection 0x1828eeb60](evidence/exploration/0x1828eeb60.c) |
| 转动与移动互斥 | 前进函数在 `_rotationCommands>0`、`_movementCommands>0` 或movement lock为真时拒绝。朝向来自 `_currentPlayerFacing`，随后转换成地图邻接方向。 | [TryMoveForward 0x1827d8650](evidence/exploration/0x1827d8650.c)；字段报告类型1633 |
| 事件触发 | 当前格存在事件、尚未清除、不是可破坏物事件、也不是格子边缘事件时，视图判断应开始事件。模型版本还在 `_isNuking` 时禁止自动触发。 | [ShouldCurrentTileStartEvent 0x1827d80a0](evidence/exploration/0x1827d80a0.c)、[ShouldTileEventAutoStart 0x1828ed4b0](evidence/exploration/0x1828ed4b0.c) |
| 事件完成与离开 | `OnEventEnded` 将当前格 `IsEventCleared` 设为true；`OnEventLeft` 仅调用当前marker的离开处理，没有在该函数中写此完成字段。因此“离开界面”不应一律等价于“清空该格事件”。 | [OnEventEnded 0x1828ece50](evidence/exploration/0x1828ece50.c)、[OnEventLeft 0x1828ed000](evidence/exploration/0x1828ed000.c) |
| 步数 | `OnStepTaken` 将 `_stepsTakenThisFloor` 加1，再通知 `PlayerTakenStep`。此函数没有直接扣血、金币或法力；监听者的特殊效果未逐一追踪。 | [OnStepTaken 0x1828ed090](evidence/exploration/0x1828ed090.c) |
| 保存 | 保存地图数据、二维玩家坐标、朝向、一个小地图状态字段和本层步数。坐标在模型偏移0xc8，朝向在视图0xa8，步数在模型0xd4。 | [PrepareSaveData 0x1828ed2a0](evidence/exploration/0x1828ed2a0.c)、字段报告 |
| 下层入口 | 存在 `DestructibleShovel` 及Dig、DelayedDescendFloor、LockMovement/UnlockMovement。`CheckExitShovel` 扫描出口格；观察到出口格有事件且已完成时调用TrySpawnShovel的分支。其前置过滤及异步完整行为仍有未解析部分。 | [CheckExitShovel 0x1828ea940](evidence/exploration/exit/0x1828ea940.c)、[OnDestructibleBumped 0x1828d34b0](evidence/exploration/exit/0x1828d34b0.c) |
| 下一层判断 | `CanMoveToNextFloor` 检查HasNextFloor并排除教程状态。不能仅凭此函数声称原版每层都必须击败Boss；出口事件/配置仍可施加其他条件。 | [CanMoveToNextFloor 0x18291d6b0](evidence/exploration/0x18291d6b0.c)、[TryMoveToNextDungeonFloor 0x18291f2e0](evidence/exploration/0x18291f2e0.c) |

已查询的元数据函数名也包含 `RotatePlayer`、`RotateThenMove`、`PlayBumpAnimation`、`StartEdgeEvent`、`DungeonMinimapView`、`DungeonEnemyMarker` 与 `DungeonEnemyAmbushMarker`，但名字本身仅证明存在相应代码入口，不证明其具体数值或所有触发方式。

## 原型采用的解释与保留差异

- 用四向格子、独立朝向、邻格碰撞、转向/前进过渡与事件期间锁定操作，取代单向节点菜单。移动后仍站在实际地图坐标，战斗结束回到同一位置。
- 地牢格子内放置可见敌人、补给点和出口，走入尚未完成的普通事件格触发界面；这种统一模型与上述事件机制兼容，但商店、营地、宝箱各自是否在原版属于普通、边缘或可破坏物事件，本次没有逐项确定。
- 原型商店可回访且保留原货物和服务状态，是为了完整流程补充的实现选择。没有找到原版“地牢商店”的专属触发与回访代码证据，不将已有城镇 `Shops.*` 误认成地牢商人。
- 原型迷雾揭示范围、可见图标、视距、贴图调色板、移动动画时长及按键映射为本项目设计；尚未提取原版所有相关配置。
- 原型保留三层守关、楼梯、楼梯回血和原有经济设计。原版已观察到铲子挖洞下层系统，当前楼梯交互只是流程替代物，不称为原样还原。
- 本次不提取或分发原版美术；像素风场景和精灵由原型独立绘制。风格接近与资产相同是两件事。

## 尚未覆盖

原版分层地图生成算法及完整房间模板、可破坏物与暗门、伏击具体条件、特殊移动方式、所有事件类别、铲子生成的全部过滤条件、各关卡出口配置、完整地牢商店机制，均未完成恢复。上述17个函数是针对本次移动/事件整合的有限静态调查，不构成原版探索系统全量复刻。

