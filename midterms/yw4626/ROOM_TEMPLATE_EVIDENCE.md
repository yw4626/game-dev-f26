# 房间模板资源证据 · 2026-10-28

本轮定点读取本机 Vampire Crawlers 发布资源，补足上一版只有房间中心的模型。没有启动原游戏、修改安装文件或提取美术到原型。这里的配置观察须与原生生成器代码调查配合；不能把配置声明说成运行时验证。

## 来源与可复查产物

证据位于 [evidence/room-layout-v5-config](evidence/room-layout-v5-config/)。`extract.py` 复用已验证的 UnityPy / IL2CPP TypeTreeGenerator 和非执行式 Odin 解码器，读取 globalgamemanagers.assets、sharedassets0.assets、sharedassets3.assets、level3，获得324条房间/标签相关记录，包含70个 RoomTemplateHandle。三个 RoomTemplateDatabase 的泛型类型树生成失败，已原样记录在 `errors.json`，不能据此宣称完整恢复数据库成员顺序。

`extract-bundles.py` 定点读取 roomtemplates-simple、roomtemplates-unique-shared 和 MadForest 专用房间 bundle，加上脚本及默认资源依赖，获得310条相关记录（46个 RoomTemplate、202个 PropTemplate、45个 GenerationTag、3个 MultiTag、14个附带物件记录），无解析失败。每条保留 CAB/文件、path_id、对象字节数、对象SHA-256；Odin保留已消费/总字节数。完整源文件SHA-256见 `sources.json`、`bundle-sources.json`。

| bundle | SHA-256 |
|---|---|
| roomtemplates-simple_assets_all.bundle | `39e8f8e2d5ec8b91dd5cb21199d982566f9647f014d958ec0da74d38734374bc` |
| roomtemplates-unique-shared_assets_all.bundle | `9c90619c022da5d37d855fed977b31a1b42951a61c78cf4d1e07c5f2c0193e11` |
| roomtemplates-unique_assets_basegame__biome-madforest_rooms_prefabs.bundle | `2f000a8c873a66a55d03e43be2bb9407dae6f02b777d4b248f60dfab2bfa3d85` |

`build-inputs.py` 从保留结果生成 `implementation-inputs.json`：46个模板、347个格子、162个出口、出生候选、原始事件坐标与条件、标签、四层选择要求和默认弹簧参数/规则。模板与handle按唯一assetId匹配，尺寸互相核对。紧凑文件的来源path_id保存为字符串，避免JavaScript丢失64位整数精度；原始JSON请使用Python等保留整数的解析器。

## 模板并不是一个事件点

RoomTemplate保存以下独立数据：

- `_roomDimensions` / `_tileTemplates`：物理格子范围、逐格路径与连接方向。
- `PathfindingFlags`：房间内部的四向连接位；不能简化为“所有相邻地面格都互通”。`ConnectionFlags`是另外的八方向连接数据，不能混用。
- `IsExitCandidate` / `ExitDirection` / `_exitCandidates`：可接走廊的格子与外向边；内部连通位不包含尚未接上的走廊。
- `_spawnPoints`：出生候选格；可能为空。终点模板也可能有出生候选，不能仅凭字段存在断言一定在此出生。
- `_preferredCentreEdge`：朝向偏好原始值；具体旋转选择与生效时机以原生代码为准。
- `_roomTemplateEventsOdin`：多个事件坐标及条件。例如普通2×2模板四格各有一条EventType=1，条件文本为对应格“not IsMapSpawnPoint”。物理房间数和战斗事件数量不是一回事。

数组布局推导为 `index=x+width*y`，并与162个独立序列化的出口坐标逐一交叉检查。内部方向解释为1=(0,+1)、2=(+1,0)、4=(0,-1)、8=(-1,0)，检查46个模板的所有内部边，均有合法邻格及反向位，零不一致。这是资源结构交叉推导；匹配原生枚举可进一步确认。若屏幕坐标采用向下为正，使用 `screenY=height-1-nativeY`，位值即可对应N=1/E=2/S=4/W=8。

零PathfindingFlags不能无条件解释为不可走：十字模板角格是零，但1×1模板也是零且拥有事件/出口。应保留整个模板占地、内部边以及出口/出生/事件格，再由生成规则决定哪些格子参与路径与渲染。

## MadForest_01可直接采用的六个模板

以下是原始数组顺序（x先变化、y递增）。完整出口方向和每个对象的SHA-256均在机器可读文件中。

| 模板 | 尺寸 | PathfindingFlags | 出口数 | preferredCentreEdge |
|---|---|---|---|---|
| RT_Generic_2x2_01 | 2×2 | 3,9 / 6,12 | 4 | 0 |
| RT_Generic_2x2_02 | 2×2 | 3,9 / 6,12 | 4 | 2 |
| RT_Generic_2x3_02-Boss | 2×3 | 3,8 / 7,8 / 6,8 | 3 | 8 |
| RT_Generic_3x3_04-Boss | 3×3 | 0,1,0 / 2,15,8 / 0,4,0 | 3 | 2 |
| RT_Generic_3x3_06-Boss | 3×3 | 0,1,0 / 3,15,9 / 6,14,12 | 3 | 4 |
| RT_Spawn_Relic_2x1_GemHammer | **1×2** | 1 / 4 | 1 | 0 |

2×3终点房间是左侧竖脊加三个右支路；三个右格虽几何相邻，却没有纵向连接。十字终点房间的四个角不参与内部路径。两个2×2模板的内部形状相同，但出口边和出生点不同，不能仅保留尺寸。GemHammer模板实际是1×2，名称的2x1不能替代字段；其出口为(0,0)、方向4，出生点为(0,1)。本轮只提供其空间模板，不等于原型已实现原版遗物效果。

## 房间选择与弹簧规则

MadForest_01楼层的 `_dungeonTag` 指向MadForest。通用模板handle持有Tag_AllDungeons；该MultiTag资源列出MadForest等地牢标签。Tag_Room_Multi_2x3-3x3列出2×3和3×3标签。下面是序列化选择器要求；随机抽样、重复模板许可和标签匹配执行顺序须由原生代码确认。

| 层 | 物理模板要求 | target / maximum |
|---|---|---|
| F1 | 2个2×2且非End；1个2×3/3×3且End | 5×5 / 6×6 |
| F2 | 1个GemHammer；2个2×2且非End；1个2×3/3×3且End | 6×6 / 8×8 |
| F3 | 3个2×2且非End；1个2×3/3×3且End | 5×5 / 7×7 |
| F4 | 2个2×2且非End；1个2×3/3×3且非End；1个2×3/3×3且End | 6×6 / 8×8 |

这不是要求F1只有三场战斗：EventGenerationLayer另设目标模板遭遇数量，且每个模板已有多个事件候选格。

DefaultSpringRoomGenerationRules（globalgamemanagers.assets:7666，对象SHA-256 `0cb4460710f7c805d0e3ea077ec4c8dc164b943f3830cb4031762da576d424ca`）有三条规则：

| 标签条件 | BoundarySpringScale | CentreSpringScale | CentreSpawnOffsetScale |
|---|---|---|---|
| Multi_2x3-3x3且非End | 1 | 1.2 | 0.8 |
| End | 0.2 | 0 | 1 |
| Multi_4x3-4x4-5x3 | 0 | -0.5 | 1.25 |

原字段为float32，所以JSON会保留1.200000047等值。默认Spring配置的200+200迭代、分离40、边界50、中心0.5、阻尼10、步长0.01等参数沿用上一轮证据，完整记录一并纳入实现输入。配置无法单独证明力的方向、积分顺序、碰撞取整与重新放置策略。

## 本轮边界

已回答：选定资源中的真实逐格模板、内部方向边、出口/出生候选、MF1楼层选择要求与默认规则参数。部分回答：坐标与方向通过全量内部边一致性推导，标签组合有资源结构证据；仍需原生代码核对具体操作。未由本资源调查回答：随机流、旋转算法、RoomSpring积分器、走廊搜索实现、完整事件条件求值以及同种子逐格复现。三个数据库的泛型解析失败、未读取其他独有地牢bundle的边界均保留，不推断为“资源不存在”。
