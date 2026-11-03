# 房间摆放与走廊：v0.5 原生证据

2026-10-28。本轮复用已有 Ghidra 工程，以 `-readOnly -noanalysis` 定点导出52个函数／协程（包括少量验证辅助函数）。全部导出为 C 伪代码及汇编，位于 [evidence/room-layout-v5-native](evidence/room-layout-v5-native/)。未运行原游戏、附加进程或修改安装目录。伪代码不是原始源码；以下是静态代码推导，不是同种子运行时逐格比对。

`inspect-fields.cjs` 先重新计算当前二进制／元数据 SHA-256，再从先前 REA Evidence `ev_5c6a02032bf310b6dc6429c4372b62dd99d449b9db3150a1cbecd86d26770b35` 恢复字段偏移，结果保存为 `field-offsets.json`。GameAssembly.dll：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`；global-metadata.dat：`319fb5addf0c9828919922d1b5949bb9248bf1e5d77b255feba0b22c7a4cf07c`。`manifest.json` 保存本轮导出文件哈希。日志和运行脚本保留在同一证据目录，后续批次共用日志且保留每批目标列表。

## 房间选择与坐标

- `SelectRoomTemplates` [0x1828696f0](evidence/room-layout-v5-native/0x1828696f0.c)：每个 requirement 的标签条件追加当前 dungeonTag，查询数据库，再按该 requirement 的数量选择。
- `SortAndSelectRooms` [0x182869b90](evidence/room-layout-v5-native/0x182869b90.c)：按 `(min(width,height),max(width,height))` 分组；每次先随机选择尺寸组，再随机选择该组中的模板。选中后没有从候选列表移除，因此允许重复模板。不同尺寸组并非按模板数量加权。
- `CreateBoxes` [0x18288c210](evidence/room-layout-v5-native/0x18288c210.c)：随机旋转0～3；奇数旋转交换宽高。初始中心是 `maximumPossibleDungeonSize/2 + NextFloat2(-offset,+offset)`，其中 offset 为全局 initialPositionOffset 乘房间标签规则的初始偏移倍率。此前若把最大尺寸误当成最终随机点范围，应以这里的中心与偏移组合为准。
- `RotatedCellIndex` [0x1828aabc0](evidence/room-layout-v5-native/0x1828aabc0.c)，在原版 y 向上坐标中：r0=(x,y)，r1=(y,w−1−x)，r2=(w−1−x,h−1−y)，r3=(h−1−y,x)。模板位移和旋转后的出口、寻路和视觉连接掩码由 [CalculatePlacedRoomToGridLookup](evidence/room-layout-v5-native/0x1828a9c40.c) 分别处理。不能只旋转外框。

## RoomSpring 的已确认流程

[ApplyLayer.MoveNext 0x1828ac010](evidence/room-layout-v5-native/0x1828ac010.c)：加载所选模板 → CreateBoxes → 初始 SpringLoop → 优化朝向 → 第二遍 SpringLoop → CreateGrid → SnapToGrid → ValidateUncontainedSpace → SplatToGrid → DisableBlockedExits → ValidatePlacedRooms。失败向上层返回 false；上层重试策略和次数未在本轮完整追踪。

默认配置的两遍迭代均为200，dt=0.01。下式来自 [SpringLoop.MoveNext 0x1828b2020](evidence/room-layout-v5-native/0x1828b2020.c) 和其辅助函数；原版使用 float，复现采用 double 时不构成位级等价。

1. 每次迭代重建邻居：中心距离小于 neighbourhoodDistance=3.5 的所有对，加上每个房间最近的另一个房间；对索引排序、规范化、去重。[FindAllNeighbours](evidence/room-layout-v5-native/0x18288e970.c)
2. 根据旧位置、速度、加速度预测 `pNext=p+v*dt+aOld*dt²/2`，开始积累新加速度。
3. 两盒沿中心连线测量 AABB 边界交点的有符号间距 sep。作用在A上的分离弹簧为 `normalize(B−A)*(sep−targetNeighbourSeparation)*separationSpringStrength`，默认 target=1.75、strength=40。A获得该力乘 `sizeSquaredB/(sizeSquaredA+sizeSquaredB)`，B获得反方向乘另一个比例，sizeSquared=w²+h²。[CalculateSeparation](evidence/room-layout-v5-native/0x18288bf20.c)、[CalculateSpringForce](evidence/room-layout-v5-native/0x18288c0a0.c)
4. 对每个房间添加中心力 `CentreSpringScale*0.5*(maximumSize/2−p)`、边界力 `BoundarySpringScale*50*(clamp(p,targetBounds inset halfSize)−p)`，减去 `10*v` 阻尼。
5. `vNext=v+(aOld+aNew)*dt/2`。最终预测位置夹在最大尺寸区域的半宽／半高内。边界缩放、中心缩放由房间标签规则决定，不能对所有房间强制相同值。

targetBounds 的起点采用整数 `(maximumSize−targetSize)/2`，加 boundarySpringPadding/2；终点由起点加 targetSize 再减 padding/2。这里整数偏移与原版浮点运算的混合应保留；不要用任意地图中心吸引代替。

## 朝向、吸附和有效性

[OptimiseRoomOrientation](evidence/room-layout-v5-native/0x18288fea0.c) 使用所有房间中心的算术平均值（[CalculateCentre](evidence/room-layout-v5-native/0x18288bb20.c) 返回 sum/count；另有未在此使用的外框输出参数）。当中心落在本房间外框内时保留朝向。否则：

- 有 preferredCentreEdge：尝试四种旋转，对指定边的法向与该边位置朝向中心的单位向量求点积，总分最高者获选；相等时保留先前最佳。[0x18288fa40](evidence/room-layout-v5-native/0x18288fa40.c)、[CalculateDirectionScore](evidence/room-layout-v5-native/0x18288be70.c)
- 无 preferredCentreEdge：打乱旋转候选，找到至少一个出口朝向中心点积大于 cos(badExitDirectionAngleThreshold) 的朝向；样本阈值90度。[0x18288f4d0](evidence/room-layout-v5-native/0x18288f4d0.c)、[IsExitGood](evidence/room-layout-v5-native/0x18288f050.c)

[SnapToGrid](evidence/room-layout-v5-native/0x182890210.c) 吸附的是 `center−dimensions/2`，舍入到最近整数后加回半尺寸；舍入辅助函数 [0x180015560](evidence/room-layout-v5-native/0x180015560.c) 显式处理半整数的偶数舍入。不是把中心全部四舍五入。

[CreateGrid](evidence/room-layout-v5-native/0x18288c690.c) 尺寸是 maximumPossibleDungeonSize + 2×mapBoundingBoxBorder。默认 border=2；[SplatToGrid](evidence/room-layout-v5-native/0x182890470.c) 将放置房间整体偏移 border。因而MF1 F1的6×6最大区域对应10×10生成网格，F2的8×8对应12×12；这是生成阶段尺寸，后续视觉边框不属于该结论。

[ValidateUncontainedSpace](evidence/room-layout-v5-native/0x1828911a0.c) 接受条件是：超出目标区域的房间数≤allowedUncontainedRooms **或** 总超出格数≤allowedUncontainedCells（默认1、4），不是两个条件同时满足。

[DisableBlockedExits](evidence/room-layout-v5-native/0x18288c810.c) 删除出口外邻接格落在其他房间矩形范围内的出口；任何房间没有剩余出口就返回失败。[ValidatePlacedRooms](evidence/room-layout-v5-native/0x1828910a0.c) 拒绝任何两房间正面积相交，边缘接触本身不等于重叠。

## 走廊出口与寻路

原版并非用房间中心直接凿 L 形走廊。此前 Delaunay→加权MST→回路证据继续有效，新增确认：

- [FindBestRankingExitTowardsOtherRoom](evidence/room-layout-v5-native/0x182887790.c) 遍历双方出口对。A出口法向与A出口至B出口方向点积 >0.707000017 时 rank2；≥−0.707000017 时至少rank1，否则rank0，取最大。浮点常量已从本机PE相应地址读取。边权使用两端排名倍率（1、1.5、2）乘距离。
- 双方最佳排名独立计算；不是对某个固定出口对的两个倍率取最小乘积。回路距离中心来自所有房间矩形范围的总外框中心，归一化距离为该中心到四个外框角的最远距离；不是生成网格中心，也不是最远房间中心。[既有 FindExtraEdgesFromUnused 0x1828985e0](evidence/exploration-v4/details/0x1828985e0.c)
- [FindBestExitPair](evidence/room-layout-v5-native/0x182887540.c) 最小化：两个出口外邻接格的 Manhattan 距离 + 两出口已使用次数。相等时保留先遇到者。[OpenExit](evidence/room-layout-v5-native/0x182887da0.c) 每次使用将该出口次数加1，并打开出口向外掩码。
- [InitPathGrid](evidence/room-layout-v5-native/0x182868960.c) 普通格 NodeWeight=defaultTraversalCost=0.5；[BlockRoomOnGridWithPadding](evidence/room-layout-v5-native/0x182868250.c) 房间外框加padding区域标记 IsRoom=true、NodeWeight=0.25，样本padding=0。模板 ConnectsToNeighbours=true 的格标记 Blocked=true，并保留旋转后的 PathfindingFlags；不能穿过房间内的无出口墙或零寻路掩码角落。
- [TryPathFind](evidence/room-layout-v5-native/0x1828a2a80.c) 将所选起点和终点出口格解除 Blocked，重置各节点父指针、g/h，执行最低g+h的开放列表搜索。先前打开的出口未见恢复Blocked，因此后续走廊可以复用它们。关闭列表节点不重开。
- [GetNeighbourList](evidence/room-layout-v5-native/0x1828a2930.c) 只检查四个方向，要求当前格掩码和邻格反方向掩码都允许。方向为N1、E2、S4、W8；Unity坐标y增加对应北。
- [StraightPathHeuristic](evidence/room-layout-v5-native/0x18285bb40.c)：`Manhattan(current,end)*current.NodeWeight + turnPenalty`。仅当current有父和祖父，且这两段方向发生变化时才加 turnPenalty=1。**同一个函数同时计算g增量和h估价**，不是常见的“仅每转一次向就在目标节点g加1”。
- [TryPathfindBetweenCoords](evidence/room-layout-v5-native/0x182868c00.c) 成功后将路径中非IsRoom节点的NodeWeight乘 travelledPathCostScale=0.5；经过多条路径可重复折扣，使后续路线偏好复用现有走廊。
- [ConstructPathForEdge](evidence/room-layout-v5-native/0x182897c40.c) 先选择并打开两个出口，再进行寻路，失败返回false；[PathMST.Apply](evidence/room-layout-v5-native/0x1828925e0.c) 按MST和额外边依次构建，失败传递到生成层。

`maximumLength=8` 确认存在于配置／字段，但本轮这条MST Apply→ConstructPath→TryPathFind执行链未找到读取该字段的指令，不能据字段名强制把任何走廊截断到8格。此结论有查询边界，不证明其他模式永远不使用此参数。

## 寻路掩码与可视连接必须分开

TileTemplate字段：PathfindingFlags(+0x10)、ConnectionFlags(+0x11)、UseProcGen(+0x12)、IsExitCandidate(+0x13)、ExitDirection(+0x14)、ConnectsToNeighbours(+0x15)。

[LinkRoomTiles](evidence/room-layout-v5-native/0x182872f60.c) 将旋转后的PathfindingFlags写入MapTile+0x58，将ConnectionFlags写入+0x59。后者是八方向视觉连接（N1/E4/S16/W64及对角位），不能直接当玩家通行掩码。

[TilePath](evidence/room-layout-v5-native/0x1828aae00.c) 对已选走廊的每相邻两格添加双向连接。[RebuildWalkablePathsBetweenTiles](evidence/room-layout-v5-native/0x1828aaa30.c) 遍历模板每个已有PathfindingFlags位，调用 [ConnectTilesExits](evidence/room-layout-v5-native/0x1828aa090.c) 给邻格补反向位。因此最终图是原掩码边的双向并集；移动时再要求两边存在即可。

资源同伴确认本轮部分Boss模板角落PathfindingFlags=0、ConnectsToNeighbours=true、UseProcGen=true。这些格属于保留的房间占地，不能因为没有可走边就允许走廊穿过。复现若将无可走边格绘为实墙，是简化视觉表达；完整原版预制体选择和连接装饰没有在此重建。

## 未完全解决

原版随机流状态／种子协议、float逐步精度、Delaunay退化点排序、全部房间标签规则、所有生成失败后的外层重试与预制体选择仍有缺口。房间模板提取见并行报告 ROOM_TEMPLATE_EVIDENCE.md。以上证据可以替换固定散点/L形连廊，但不能宣称相同种子得到原版完全相同地图。

