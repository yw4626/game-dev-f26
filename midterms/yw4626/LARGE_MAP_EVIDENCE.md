# 扩大的模板地图 · v0.6

2026-10-28。本次复用已提取的原版RoomSpring配置和46个模板，未运行或修改原游戏；原生摆放与走廊规则沿用 `ROOM_LAYOUT_NATIVE_EVIDENCE.md`。本轮不是把所有格子简单放大，而是选取后期关卡的真实尺寸和更大房间模板。

## 采用的原版配置

原始记录位于 `evidence/exploration-v4-config/configs.json`，标签及模板位于 `evidence/room-layout-v5-config/configs.json` 和 `implementation-inputs.json`。文件身份、对象SHA-256及解析方法保留在对应证据目录。`import-room-templates.cjs`按对象ID选择以下记录，输出数据继续保存源文件、path_id字符串和对象哈希。

| 原型层 | 原版配置 | sharedassets0 path_id | target / maximum | 最终网格 | 房间需求 |
|---|---|---:|---|---|---|
| 1 | MadForest_03_F4 | 31008 | 6×6 / 8×8 | 12×12 | 2个普通2×2、1个普通2×3/3×3、1个终点4×3/4×4 |
| 2 | MadForest_03_F5 | 31009 | 8×8 / 10×10 | 14×14 | 1个普通2×2、2个普通2×3/3×3、1个终点5×3 |
| 3 | DairyPlant_01_F5 | 30900 | 9×9 / 10×10 | 14×14 | 2个普通2×3/3×3、1个普通4×3、1个终点5×3 |

最终网格尺寸由原生CreateGrid规则 maximum + 两侧各2格得出。将这三个不同原版阶段作为本原型的三层流程是**适配设计**；不声称原版按这个顺序连接关卡。原型的背景、敌人强度、商店和三层结局继续沿用自己的流程。

导入器现在保留36个属于AllDungeons、MadForest或DairyPlant的已提取模板；每层仍按biome和需求标签筛选，先均匀选尺寸组，再选该组模板。更大的普通房间包含完整、环形、H形、十字或多通道等真实内部连接；无路径角格仍占据房间矩形，不能让走廊穿过。4×4终点模板没有在当前提取集合中出现，因此第一层的可用终点池实际是已提取的4×3模板；这是保留证据的覆盖限制，不是宣称原版没有其他候选。

## 大房间的弹簧参数

此前原型主要覆盖2×2和终点房间。本次接入默认规则中另外两组已提取标签倍率，并按原生逻辑叠乘：

- 普通2×3/3×3：中心力×1.200000047、初始偏移×0.800000012、边界力×1。
- End：中心力×0、边界力×0.2、初始偏移×1。
- 4×3/4×4/5×3：边界力×0、中心力×−0.5、初始偏移×1.25。

End大房间同时匹配后两组规则，中心力仍为0，而不是强行变为向外排斥。两遍200次迭代、出口评分、四向寻路、已走廊费用折扣仍沿用既有规则。

## 事件、物品与宝石位置接口

更新：本节描述 v6 历史实现；v8 已以模板区块分配替代全图距离分配，普通箱桶改为两个，走廊留白。当前接口与验证见 `BATTLE_ZONES_EVIDENCE.md`。

新地图格式为version6；旧存档保存完整网格，不重新生成旧楼层，下一层才采用新布局。每层八个现有事件仍是原型适配。此前事件全部挤在离出生点最近的格子，本版按从出生点的路径距离分散安排服务、宝箱与遭遇，出口仍在终点模板的原事件坐标。此距离分配不是原版EventGenerationLayer的完整条件重现。

- `d.objects["x,y"]`：现有木桶、箱子、金币或治疗掉落；包含type、active、broken与reward，供地图物品说明使用。
- `d.gemSites`：两个已连通的空位`[{x,y},{x,y}]`，排除出生点、事件和既有物件，在约35%和75%路径深度附近选择；供主流程生成宝石获取事件。
- `d.generation.sourceProfile/source`：当前采用的原版配置名与对象来源。

宝石空位数量、深度和映射方式是原型适配；宝石获取规则必须结合本轮宝石证据，不能用空位设计代替原版掉落证明。地图UI应只列出已经发现的坐标，并直接展示物品名称／数量／治疗量及交互状态；未发现区域不因清单被暴露。物件清空后对应地图信息也应消失。

## 验证

`node --test tests/dungeon.test.cjs`全部17项通过。100种子×3层的300张地图检查：尺寸12／14／14，四个物理房间，至少25个可走格，八个事件可达，两个宝石空位可达且不与事件／物件重合。50张图逐格比较模板旋转后的内部连接与占地。

修改后的八局真实引擎旅程全部通关，共669次移动尝试、24次商店访问、48次挖掘步骤；此前相同测试种子策略为311次移动，说明可玩路径实际增长，不只是小地图画布变大。该结果仍只是固定测试策略，非玩家胜率。默认CRAWL-01三层可走格数为33、50、47；后续主任务增加宝石内容不改变这些拓扑统计。

仍未等价重建原版随机流、浮点逐位结果、全部模板数据库、事件条件和外围失败重试策略。新地图最多128次生成尝试，不保证同一原版种子得到相同地图。

## 地图与物品信息 UI（v6）

- 小地图每格 24 个 SVG 单位，已发现格直接显示木桶、箱子、铲子、宝石箱等名称；金币和鸡肉在容器破坏后才显示实际数量。未发现物品不会写入地图或物品列表，容器预生成的掉落内容不会提前展示。
- 地图格提供悬停标题、可聚焦的无障碍名称；折叠列表列出已发现物品及坐标。玩家格用描边和角落箭头标出，以免遮住当前格的文字。
- 第一人称画面只标记前方 3 格内、通过墙体深度检查的物品，最多 3 个标签；文字使用与物品图像相同的墙体深度裁剪，避免隔墙显示。
- 上述显示方式是复现原型的可读性设计，不主张与原版 UI 像素级一致。
- QA：app.js / dungeon-view.js 语法检查通过；函数级 UI 测试确认封闭容器中的 8888 金币与未发现的 9999 金币没有泄漏，已揭示 7 金币和 10 治疗正常显示；渲染 mock 确认隔墙物品连标签查询都不会触发。浏览器最终视觉验收由主任务统一进行。

## Five-floor prototype extension (v10)

Newly generated floors now use12×12,14×14,16×16,18×18,20×20 screen grids. Physical room counts are4,4,4,5,6; battle-zone counts are2,2,2,3,4, alongside one service zone and one boss zone. Event nodes still come from Run; the generator distributes battle/elite events evenly across battle zones. Two containers, two gem sites, and two cart sites remain room-only, with a reserved clear cell in every physical room.

Only the first two profiles keep their extracted dimensions unchanged. Floor3 enlarges the third profile's target/maximum bounds. Floors4/5 reuse that profile's verified room templates and add one/two middle-sized non-boss rooms. These dimensions and room counts are prototype progression choices, not evidence of native floor4/5 generation. Every template's internal edge mask and source hash remain intact. `floorProfile(floor)` exposes this configuration; `generation.scaleAdapter` identifies the source profile, original dimensions, and added room count. Existing saved maps are restored as serialized and are not regenerated.

Validation: `node --test tests/room-zones.test.cjs` passed4/4 tests, including300 earlier three-floor maps plus250 maps spanning five floors. The new250-map test checks full reachability, exact internal template edges,10/12-event stress cases on floors4/5, nonoverlapping events/supplies, two real cart placements, empty corridors, clear cells, and immutable source profiles. Across50 seeds per floor, reachable cell ranges were30–37,35–51,47–74,57–80,67–88; at most5 attempts. Grid dimensions strictly increase, while randomly selected room shapes cause reachable-area ranges to overlap between adjacent floors.
