# v0.8 角色、卡牌类型与进化配置

本文件记录序列化资源与实现的对应关系。原生函数与完整材料消费链见 `CHARACTER_EVOLUTION_NATIVE.md`。原游戏安装只读，本轮没有新增运行时采样。

## 可重建的数据

`import-characters-evolution.py` 从已有 `configs/cards.json`、`configs/decoded-configs.json`、`evidence/levels-v7-config/implementation-inputs.json` 与宝石 compact evidence 生成 `dist/characters-evolution.js` 和 `evidence/characters-v8-config/implementation-inputs.json`。输出包含输入文件 SHA-256、每个资源的文件/PathID/对象 SHA-256，完整的 162 卡类型/组映射与类型颜色。生成器不会读取或修改原游戏存档。

| 资源 | 文件:PathID | 对象 SHA-256 |
|---|---|---|
| Antonio FCC | sharedassets0.assets:31725 | ed67ec31e3d1eb2bb5b837f1d3ae68c44d6dd17daca9eed9766ad5a2ca5b7c6d |
| Antonio DeckConfig | sharedassets0.assets:31894 | 3d0d19730bf5f0e3036a740982af9074772dcf9b501d1d2d6ebb67ca1d6d7194 |
| Imelda FCC | globalgamemanagers.assets:7774 | 94106d51230edf4d56d5cceac0f6c762cc4132142f16e6555e258da738f016a1 |
| Imelda DeckConfig | globalgamemanagers.assets:7791 | 9f277cf7e4c1a19f12dce0eb6a1809c305fb09b876220fc56e4459ed761185d9 |

## 已实现角色

- Antonio 起始 5 张：FCC_Antonio、0费 Whip×2、0费 Armor、1费 Spinach。最大生命 +10。角色卡本身0费，立即获得基础3护甲（乘本牌连击），激活5次响应；每次攻击类型牌主效果完成后，Might固定+10。第五次仍生效，然后角色卡进入弃牌堆。
- Imelda 起始 5 张：FCC_Imelda、0费 MagicWand×2、0费 Armor、1费 Attractorb。MagicWand的asset ID含`_1_`，但实际配置mana_cost与getter结果为0，应以字段为准。起始法力修正+1，Growth+20。角色卡本身0费，立即经验为 `ceil(15 × combo × (1 + Growth/100))`，默认首次18点；每张Special牌主效果完成后Growth固定+1，最多5次，增加值跨本次探索的战斗保留。
- Duration只增加激活时的响应次数，并一次消耗该次Duration加成；不乘combo。回合结束不减少响应次数，不自动重新激活角色卡。当前两张FCC均无宝石槽。
- 颜色与类型分别取自原CardType资源：Attack深红、Defense浅蓝、Mana紫、Special黄、Character青绿。原始浮点RGBA完整保留，不能按费用或者主效果猜测牌类型。

新Run默认采用v8角色牌组。`rulesVersion:7`显式保留此前14卡适配牌组；已有v6/v7存档不会自动注入角色卡或重写牌组。

## 已实现进化

| 配方组 | 成品 | 费用 | 每击基础伤害 | 基础命中数 |
|---|---|---:|---:|---:|
| MagicWand + EmptyTome | Holy Wand / 神授魔杖 | 2 | 20 | 8 |
| FireWand + Spinach | Hellfire / 地狱火 | 3 | 15 | 15 |
| Knife + Bracer | Thousand Edge / 千刃 | 3 | 20 | 10 |

三张成品默认解锁，但 `addToRewardPool=false`；不会混入升级或商店普通卡池。每个配方匹配CardGroup，故已支持的不同费用Tome/Spinach变体可以充当对应组材料，无普通卡等级升级要求。三张成品的基础等级均0，命中数随combo增长，具体DamageEffect原始flags一并保留。

执行时选择具体武器与辅助实例，武器必须有空槽并允许Evolve标签。生成新ID，删除两张材料，只继承主武器的宝石和槽数，再加入占一槽的进化宝石。辅助材料宝石随材料消耗，不合并。未来扩槽沿用原武器配置的升级上限与同类同步规则。Run操作发生在战斗外；下一场战斗统一按本原型牌组洗牌流程载入成品。

API：`Run.evolutionChoices()`给出实际材料组合；`Run.evolution`包含floor、returnPhase、choices。候选含id、recipeId、resultKey/resultName、componentIds、components、weaponId/supportId、inheritedGems、lostSupportGems、gemSlots。`Run.fuse(choiceId或index)`或`skipEvolution()`一次结算。保存后恢复重新核对实际材料，不信任缓存候选内容。

## 明确的原型安排

- 第1/2层Boss结束、待处理经验升级选择完成后，各提供一次进化机会。这是可玩流程的安排；原生已证实地图进化雕像入口，尚未证明每个Boss固定给机会。
- 可以直接选择Imelda；原版她需要城镇购买（配置价格10）。尚未实现完整城镇角色购买、额外队员、疲劳模式、Arcana。
- 保留此前demo/base战斗参数档位；角色基础属性修正在所选档位上相加。demo扩展普通卡池仍是演示适配，base按默认解锁过滤。
- 成品已接入原伤害/命中数与简单宝石计算；不同投射物路径、暴击、击退、穿透、特殊目标选择仍沿用既有战斗适配。未把所有原版进化卡都宣称已实现。

## 验证

`tests/characters-evolution.test.cjs`覆盖精确起始牌组、属性、FCC时点/持续/第五次响应、经验舍入与跨战斗Growth、升级选择先于进化、双材料消费与宝石继承、占槽、扩槽、保存恢复/坏数据、v7迁移，以及两名角色共8条真实战斗完整旅程。旧105项测试继续保留；其中v7特定测试显式锁定v7牌组适配，不把新角色假设倒灌到旧存档语义。
