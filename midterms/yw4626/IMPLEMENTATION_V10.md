# v0.10 实现、原生证据和适配边界

日期：2026-10-29。原游戏文件只读；GameAssembly.dll SHA-256：`0bee2d8f39c9e0d6d424879c5eaa7fb60e7fb5b2c2554bcbf1ff1c6908242be7`。

## 数据与接入

`evolution-v10.js`由提取配置生成，包含技能、武器变体、19组配方、颜色/卡组/宝石槽与原始效果字段；`wild-v10.js`保存15种W及获取权重；`effects-v10.js`实现已确认消费者。`engine.js`合并旧数据保证旧局行为，`run.js`负责跨战斗状态、获取、Boss奖励和五层流程。

96项目录中有未开放项。扩展奖励池过滤`runtimeEnabled=false`和`sourceDisabled`。本轮没有将未验证的专用持续效果伪装成即时伤害。

## 已确认并落地的关键规则

- 原版`CardModel.RefreshReceivesComboMultiplier → Arcana.TryApplyWildStrength`检查奥秘和`isPickup`；有奥秘才使拾取W受连击。普通W自身配置仍可接收连击。
- 地面拾取：`DestructibleCard.OnDestructibleBumped → OnTweenOutComplete → Player.AddCardConfigToDeck → AddCardConfigToCardPile(DrawPile) → RegisterCard`。不是碰到就执行卡牌效果。
- Canvas共享池：小钱袋10、钱包5、大钱袋5、花瓣5、三叶草30、怀表10、念珠5、聚星宝珠5，总权重75。
- 石像源配置：金币60、卡牌30、城镇重掷10。原型未实现城镇重掷，只在60:30的已支持项中归一化；金币10与每层一座石像是平衡适配。
- 升级直接入手分支设置免费，抽牌堆分支不设置；首次成功出牌恢复默认费用。未使用时在回合末清除免费是按用户要求增加的到期规则，不冒称原生已证实。
- Area：`(武器Area+玩家Area)/100 × 原始单击伤害 × 0.2`，作用到所有当前前排，包括仍存活的主目标。保留小数护甲/生命。溅射不继承主击暴击/冰冻倍数，也不消耗冰冻。
- Crit chance为基础概率乘`1+Luck/100`；critical-effect enum分别为一次攻击、每发、每次暴击、不触发。血笞的暴击治疗按原生触发方式去重。
- Recovery在胜利后治疗一次。增加MaxHP只提高上限。复活每100充能给1次，最多3次；复活恢复至向上取整的最大生命。
- 冻结使意图暂停；后续非溅射攻击伤害×2并消耗1层，消耗完恢复缓存意图，敌人回合结束清除冻结。层数不代表连续跳过多个回合。
- 念珠先拍摄最前N排目标快照；伤害为护甲加`min(当前生命,(1−即死抗性)×最大生命)`。原型Boss使用0.9即死抗性是明确的平衡适配。
- 翅膀减费固定−1、每张当前手牌最多一次，后来抽入的牌不受影响。原生允许负费用，原型保留其返还法力结果；用后或回合末清理。
- 天堂之剑弹跳：基础20%乘运气，每次成功后概率乘0.8，遇首次失败停止，最多100；保存独立效果随机流。
- 大蒜/噬魂的RemoveIntent分别限1/2个前排目标；`removeAllIntents`改变意图过滤，不取消数量上限。击退按抗性去除攻击动作，不删除同一混合意图中的护甲动作。

## 合成开放范围

可用10组：Bloody Tear、Holy Wand、Unholy Vespers、Death Spiral、Heaven Sword、Hellfire、NO FUTURE、Soul Eater、Thousand Edge、Phieraggi。

待专用效果7组：Gorgeous Moon、Valkyrie Turner、Vicious Hunger、La Borra、Thunder Loop、Vandalier、Mannajja。部分配置与调用链已提取，但其持续、回合末追踪或死亡标记等尚未接入完整运行模型，图鉴置灰。

源版本NOTUSED两组：Fuwalafuwaloo、Infinite Corridor；Vento Sacro、金/银戒指材料也保留源禁用状态。不能仅凭用户合成表推断当前安装版本全部可用。

圣经材料为资源中的`CardGroup_Spellbinder`。同一组不同费用变体均可参与；三材料配方也按唯一卡牌实例匹配。主武器空槽、材料消耗、宝石继承和进化宝石占槽都被验证。

## 原型范围与未完成分支

- 五层、逐层尺寸12/14/16/18/20、区域4/4/4/5/6、敌群预算和前四层Boss三选奖励是用户要求的流程适配。
- 15种W配置中12种可自然获取。小心心、原始法力、单枚金币的完整原生生成路线尚未开放。友情护符回手宝石专属额外连击未开放。
- Duration接入角色卡可触发次数；未完整恢复所有持续武器。Curse目前接入XP，未完整恢复敌方增强消费者。Greed接入金币W，未宣称所有地图经济分支完成。
- 旧版已有武器继续兼容旧数值和攻击模式；新增复杂专用武器按可执行状态过滤。完整城镇/成就、其他角色、原生随机流、全套敌人和物理弹道不在本轮完成范围。
- v9/更早存档保持原版本和三层长度；新局默认扩展卡池并启用Wild Strength，用户可以在首页关闭奥秘或改用原始解锁池。

原始证据与地址详见 `WILD_ACQUISITION_V10_NATIVE.md`、`EVOLUTION_V10_CONFIG_EVIDENCE.md`、`EFFECT_CONSUMERS_V10_NATIVE.md`；地图见 `LARGE_MAP_EVIDENCE.md`；敌人显示见 `ENEMY_LAYOUT_V10.md`。
