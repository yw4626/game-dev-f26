# v0.9 攻击模式、敌群与 W 卡实现

## 原版证据与范围

原生取证由 `evidence/attack-patterns-v9-native/` 保存，机器表 `attack-configs.json` 含每张卡的资源位置、对象SHA-256、Targeting对象与全部等级配置。`import-attack-patterns.py`只生成当前支持的16张攻击牌，不从名称猜攻击方式。配置与原生行为的逐项说明以本轮原生报告为准。

攻击不再统一打选中的一个敌人。每排有5列；每列只暴露最前面存活的敌人，死亡后同列后方补位。当前敌群最多两排，地图站位与UI使用同一个`slot:{row,column}`，column范围0..4。

| 卡牌/类型 | 当前实现 |
|---|---|
| King Bible | 左→右逐列，基础5发、每发1个敌人，末列后回绕。不是每发全体伤害。 |
| Axe | 左→右逐列，基础3发、每发穿过2个不同敌人，列指针跨发延续。不是固定单体。 |
| Whip | 左→右前排横扫；有效穿透5，原配置pierce3被原生fallback覆盖。默认没有左右交替索敌。 |
| MagicWand/HolyWand | 右→左，优先攻击意图；优先目标用尽后回退其它存活列。 |
| Knife/Carrello | 右→左，分别按各自有效穿透上限处理。 |
| Fire/GattiAmari/Runetracer/Cross/Lightning/Hellfire | 每次出牌建立随机列袋，抽出列后不放回，袋空补充；空列和不合格列也会被抽出并跳过。 |
| Cross | `pierceType=MultiHit`允许同发重复击中同一敌人。其它已支持牌同发按敌人实例去重。 |

这里“发数/波数”和“命中数”不同：连击与Amount先计算发数，然后每发按targeting/有效pierce寻找目标；宝石伤害倍率仍只作用于每击伤害一次。每个目标独立扣甲、扣血，死亡事件仅记一次。16张卡基础Area都是0，没有额外面积伤害。物理投射物、击退、暴击、完整Area属性效果仍不在本轮引擎范围；不能把“横向多发”写成原版全体AOE。

原生effectivePierce链为DamageEffect/Targeting/Direction的AllowsPierce共同判断，成立才使用配置值，否则用Targeting.GetPierce。Whip使用5的fallback，Runetracer使用1；其它当前牌用配置值。`definition(card)`同时保留configuredPierce、effectivePierce/pierce、attackPattern、targetingMode、area。

## 预览与事件接口

`engine.attackSummary(def,player,multiplier,enemies,gemMultiplier)`与`Battle.cardPreview(card)`提供：damage、hits/waves（发数）、attackPattern、targetMode、configuredPierce、effectivePierce/pierce、area、targetCount、maxImpactCount、totalDamage。

- 静态卡面省略enemies或传空数组时显示理论上限；实战传当前敌人列表，按剩余敌人数限制单发去重上限。
- `totalDamage=damage×maxImpactCount`是未扣护甲的理论上限；不是承诺全部可达目标都活到后续发数，也不等于实际掉血。
- `enemy_damage`继续提供完整HP/护甲前后数值，并加wave、hit、pattern、pierceIndex、slot。hit是本牌实际命中序号，wave是第几发。
- 新局使用自动索敌，不需要手工选目标。新独立随机列流进入存档；它是本原型的可复现随机实现，不声称复刻Unity全局随机序列。

## 更多敌人的预算

`dist/encounters.js`显式是遭遇适配。普通3–4只、精英4–5只、Boss为1个大怪加2–3个小怪。ghost、zombie、skeleton、bat、slime、golem与3个Boss外观分别使用visualKey/name/english；行为基底仍引用已验证的Ghost/Zombie/Lion三种配置。新外观不冒充新逆向出来的敌人AI。

每场从旧版本同层/同类型遭遇计算HP、基础XP、初始护甲、最大单回合攻击总量、最大护甲动作总量，再按固定权重分摊给更多实例。各总量不随人数直接增长。每个实例保存xpOverride，经验读取该值而不是给每个换皮敌人再发一次完整原基底XP。Growth/Curse最终向上取整可能带来小幅整数差异，不宣称逐敌取整后完全相同。

新Run为combatVersion9；原有存档没有该字段时沿用8：保存中的敌群与旧局未来遭遇都不强制改写。progressionVersion仍为8，表示角色/FCC/经验/进化规则版本，与战斗版本独立。

`tests/simulate-v9.cjs`使用真实地图移动、破坏/拾取成长推车、实际战斗、升级选牌、商店购买、营地、Boss、挖掘与保存恢复。48条对照旅程（旧/新战斗各24，两角色×两档×6种子）均可通关；v9的24条都购买并使用了W，最终Boss均带3个小怪。平均等级基本保持：Antonio约3.33，Imelda约6.0–6.17。这是固定启发式策略的回归，不是玩家难度研究。结果保存于`evidence/attack-patterns-v9-native/balance-journeys.json`。

## W：四叶草花瓣

`import-wild-cards.py`从`Card_E_CloverPetal`生成`dist/wild-cards.js`，证据摘要为`evidence/wild-v9-config/implementation-inputs.json`。

- W费用为0，当前牌自动接续；上一张为W时，下一张普通牌也自动接续，随后恢复该普通牌的费用阶梯。W自身连击次数仍+1。状态字段为`battle.previousWild`，预览含wildcard/followsWild。
- 花瓣依次Luck+5、抽1、销毁。`ReceivesComboMultiplier=false`，Luck和基础抽牌不乘连击。已有Magnet仍按普通抽牌规则增加请求量。
- 原生销毁在离开连击堆后处理。出牌标记pendingDestroy；断连、回收、回合结束时进入destroyed归档，胜利结算也清理待销毁牌。Run同步事件后永久移除该UID；destroyed归档只用于本战审计/实例守恒，不会洗回牌堆。
- Luck新局来源是PlayerConfig.baseLuck=0；PlayerModel中100的prefab占位会被Reset覆盖。当前Luck保留到本次探索后续战斗，存在run.combatBonuses.luck和battle.player.luck。
- 已接入一个真实Luck消费者：宝石箱额外1个选项的概率为`Luck/100 × LuckChanceModifier`，原配置系数约0.1。Luck5对应约0.5%，不是5%或保证第四项。首次打开保存结果，取消/重开与刷新不重新掷骰。完整幸运暴击、全部掉率与混合升级奖励系统尚未恢复。
- 原版花瓣为pickup、非普通奖励池。为了能直接体验，当前base/demo首层商店保证1张，价格15金币；这是明确的获取入口适配。原5张起始牌组保持不变。
