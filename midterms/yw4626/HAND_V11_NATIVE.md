# 手牌容量、扇形排列与悬停：原生证据

日期：2026-10-29。目标为本机 `D:\steam_data\steamapps\common\Vampire Crawlers` 的已安装构建。GameAssembly.dll SHA256 为 `0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`；字段提取脚本对既有二进制和元数据摘要均校验一致。新增证据在 `evidence/hand-v11-native`，没有启动或修改原游戏。

## 结论与实现边界

- 原版使用随数量挤密的扇形手牌，而非强制让所有卡牌互不重叠。选中时其他牌会向两侧让开，悬停牌会升高、放大。
- **原版不是所有模式统一7张上限。** 无手牌限制模式的 `CanAddCardToHandPile` 直接返回 true；有限模式才从 DealCount.max 读取容量。既有4/7配置属于有限手牌模式。
- 20张是原版扇形配置中“根据数量增加选中分开偏移”的插值终点，**不是证据支持的全局手牌上限**。浏览器若采用20张技术容量，应明确是原型适配。
- 每回合发牌请求量、即时抽牌量和手牌容量是独立概念。扩大显示容量不能直接把所有回合的发牌数改成容量值。

## 容量与抽牌

已复用 `PICKUP_NATIVE_EVIDENCE.md`、`evidence/pickups-v7-native/0x1829556f0.c`、`reverse_engineering/vampire-crawlers/native/0x182944ce0.c`，避免重复反编译。

| 方法 | 地址 | 结论 |
|---|---|---|
| PlayerModel.CanAddCardToHandPile | 0x182944ce0 | HasHandSizeLimit=false时直接允许入手；有限模式比较有效占位数量与容量 |
| PlayerModel.TryGetCurrentMaxHandSize | 0x1829556f0 | 无限制模式写出-1并返回false；有限模式取DealCount.max并向下取整；可选择加HandSizeDrawOffset |
| DungeonModel.HasHandSizeLimit | 0x18291daf0 | 由当前地牢与运行设置计算，并非固定常量true |
| PlayerRunSettings.IsHandSizeLimitActive | 0x1829c4280 | 根据解锁/进度选择运行设置的开关或地牢生成配置中的ForceHandSizeLimit |

GlobalConfig `globalgamemanagers.assets:7720` 的 runModeConfig：BaseHandSizeLimit=4、MaxHandSizeLimit=7、HandSizeDrawOffset=0。普通非初始抽牌才加offset；当前正在打出的牌在符合条件时会提前释放一个占位。手满未抽出的牌留在抽牌堆，见既有抽牌链证据。

卡牌护腕 `DealCountEffect` 的有限模式路径会提高DealCount.max并以MaxHandSizeLimit封顶；地图护腕增加runBaseModifier，不应自动视为修改max。战后有限模式max会恢复BaseHandSizeLimit，详见 `PICKUP_NATIVE_EVIDENCE.md`。

本次没有观察原版实战超大手牌，也没有证明无手牌限制模式在其他系统中绝无任何技术保护；结论范围为上述容量资格判定路径。

## 扇形与重叠

本次从原始Unity资源重新读取的连接关系：

1. `level3:22984` HandCardSlotHolder（对象SHA256 `76481c092659f1610d052899c088d07823bc17d00d43f3246f5aec1e900cde11`）的 `_layoutGroup` 引用 `level3:23292`；`_allowsHovering=1`、`_allowsDragging=1`。
2. `level3:23292` HorizontalCardLayoutGroup 的 `_maxSpacingBetweenElements=115`，`_fanningConfig` 引用 `sharedassets3.assets:19962`。
3. `sharedassets3.assets:19962` HandPileFanConfig，SHA256 `33a2514765ca6a0ecab56b66abffbfb03737f52ddd7781bf8967ed943e5fa3a1`：

| 字段 | 原版值 | 意义 |
|---|---|---|
| MaxPositionOffset | 32 | 沿副轴的弧形位移幅度，使用PositionOffsetCurve |
| PositionOffsetCurve | (0,0)、(0.5,1)、(1,0)，含加权切线 | 中心和两端的弧度曲线；不是简单直线排列 |
| MaxRotationOffset | 15 | 最外侧旋转幅度，左右方向相反 |
| RotationOffsetCurve | 0→0，1→1 | 此资源为线性旋转曲线 |
| DefaultCardRotation | (0,0,0) | 默认旋转 |
| SelectedCardRepelAmount | 64 | 选中时其他牌分开的基础量 |
| MaxRepelOffset | 64 | 配合RepelFalloffCurve的额外量 |
| MinMaxCardsForSplit | (6,20) | 随手牌数量增加的分开偏移插值区间 |
| LeftSplitMinMaxOffset | (0,48) | 6至20张时左侧额外偏移 |
| RightSplitMinMaxOffset | (0,96) | 6至20张时右侧额外偏移 |

对应定点反编译：

- `CardLayoutGroup.CalculateSpacingAlongAxis` **0x18278c600**：结合容器尺寸、子元素数量、最大间距、元素min/preferred/flexible尺寸计算布局空间，不是固定间距无限横向延长。
- `AlignOnPrimaryAxis` **0x18278c0b0**：为每张牌调用扇形旋转与选中偏移，再按计算后的尺寸分配位置。
- `FanCardPosition` **0x18278c890**：根据索引归一化值取PositionOffsetCurve，乘MaxPositionOffset应用副轴偏移。
- `FanCardRotation` **0x18278c9b0**：超过阈值时按 `i/(n-1)` 映射左右旋转；`CardLayoutGroup..cctor` **0x18278d450** 确认 `s_minCardsToFan=2`。因此1～2张不按索引展开旋转，3张开始铺开。
- `GetSelectedCardOffset` **0x18278d010**：选中牌自身偏移为0，其他牌按选中索引位于左/右侧分别施加偏移；读取SelectedCardRepelAmount、MaxRepelOffset和曲线。
- `CardFanConfig.GetLeftSplitOffset` **0x1829779f0** / `GetRightSplitOffset` **0x182977a80**：`t=clamp((n-6)/(20-6),0,1)`，分别线性插值0→48和0→96。这证明20是布局插值范围，而非抽牌上限。

这些数字使用Unity UI坐标。浏览器中的CSS像素、卡牌宽高和可用空间不同，不能把115或64无条件按同一屏幕像素照搬。合理的响应式间距、较小倾角、悬停时限制卡牌在视口内属于UI适配。

## 悬停

GlobalConfig.hoverCardConfig来自同一对象 `globalgamemanagers.assets:7720`（SHA256 `2487f88bb55f9e72567c0b8c1ac25a9754aa2c3a6a078f47f1f4b9c3dadaa9fe`）：

- 可支付卡：scaleTo=(1.5,1.5)、hoverHeightOffset=38。
- 不可支付卡：invalidScaleTo=(1.05,1.05)、invalidHeightOffset=15。
- scaleDuration=0.05秒、moveSpeed=750；另有倾斜和阴影参数。
- hoverCardConfig与handPileConfig摘录保存为 `global-hand-config.json`，后者cardSpacing=14、defaultCardReorderDelayTime=0.5秒。不能把这里的14与布局组件最大115混为一谈。

`InteractableCard.DoCardHoveredAnim` **0x182725fc0** 实际调用 `PlayerModel.CanAffordCard` 后选择可支付/不可支付两套放大和抬高参数；`OnHoverStarted` **0x182727080** 设置悬停状态并启用卡牌视觉，`OnHoverEnded` **0x182726fd0** 清理悬停状态并在非拖拽条件下返回。视觉阅读和实际出牌资格仍应分开：浏览器可以让不可支付卡也完整展开方便阅读，但不能因此允许出牌。

## 复现

在工作区根目录运行 `tools/unity-assets/Scripts/python.exe vampire-crawlers-prototype/evidence/hand-v11-native/extract.py` 可重新导出22条布局、手牌和扇形配置；`extract-fields.cjs` 导出字段偏移且检查二进制摘要。`run.ps1` / `run2.ps1` 使用既有Ghidra项目、`-readOnly -noanalysis`，只定点分析上述13个方法并将原数据库改动丢弃。

没有新建REA静态会话，没有启动原游戏或改变安装目录。没有把UI适配或容量20声明为原版固定规则。
