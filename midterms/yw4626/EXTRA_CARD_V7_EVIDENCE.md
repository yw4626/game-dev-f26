# 原版辅助卡配置与接入边界

从现有 `reverse_engineering/vampire-crawlers/configs/cards.json` 和 `decoded-configs.json` 重新筛选，不重新启动 Ghidra，不修改原游戏。`import-support-cards-v7.cjs` 可重建两个导出：

- `dist/extra-cards-v7.js` / `ExtraCardCatalogV7`：11 张供主任务接入的卡牌。
- `dist/extra-card-v7.js` / `ExtraCardV7Evidence`：15 张配置候选及 4 张明确排除的抽牌/治疗/生成牌，供后续研究。

两个输出都保留原始资产、对象 SHA-256、输入文件 SHA-256、效果结构、宝石槽限制和解锁成就引用。生成脚本只输出配置，不自动改变引擎或奖励池。

| 导出 key | 原名 | 费用 | 原始基础效果 | 原始资源位置 |
|---|---|---:|---|---|
| tome | 空白之书 | 0 | 法力 +1 | sharedassets0.assets:31746 |
| lightTome | 轻薄之书 | 1 | 法力 +2 | sharedassets0.assets:31747 |
| weightyTome | 厚重之书 | 2 | 法力 +3 | sharedassets0.assets:31748 |
| ancientTome | 古老之书 | 3 | 法力 +4 | sharedassets0.assets:31749 |
| lightArmor | 防御 | 0 | 护甲 +2 | globalgamemanagers.assets:7771 |
| rainbowArmor | 彩虹防御 | 2 | 护甲 +6 | sharedassets0.assets:31697 |
| spinach | 菠菜 | 1 | 威力 +10 | sharedassets0.assets:31766 |
| sprig | 老菠菜茎 | 2 | 威力 +20 | sharedassets0.assets:31776 |
| duplicator | 双鸾宝镯 | 1 | 发射数量 +1 | sharedassets0.assets:31762 |
| duDuplicator | 叒鸾宝镯 | 2 | 发射数量 +2 | sharedassets0.assets:31772 |
| bracer | 护腕 | **0** | 发牌数 +1 | sharedassets0.assets:31768 |

导出字段为 `kind: mana/armor/might/amount/deal`，对应 `mana/armor/might/amount/dealCountBoost`。护腕资产名虽然是 `Card_S_2_Bracer`，真实费用字段为 0，不能从名字中的数字推导费用。

## 卡牌等级、角色等级、解锁

以上每张辅助牌的 `_maxLevel` 都为 **0**。不同费用的书、菠菜、宝镯和护甲是不同 `CardConfig`，不是同一辅助牌的 +1/+2 强化。不要给这些牌沿用原型的任意数值升级。

多数牌使用 `AchievementUnlockType`。默认直接解锁的是本表的基础防御和菠菜；其他牌的完整成就引用已导出。配置中的 `addToRewardPool=true` 只表示可参与奖励池，并不证明开局就已解锁，也不等价于角色达到某等级。角色 XP/升级与奖励选择由独立的 progression 研究处理。

## 连击与持续时间

全部 11 张牌原始 `<ReceivesComboMultiplier>k__BackingField=1`，导出中明确保留 `receivesComboMultiplier:true`；这是配置证据。

已留存的 `CardEffect.GetComboAmount` **0x1826e3720** 在启用连击且未被忽略时将基础数量乘玩家连击，并继续处理卡牌效果倍率。`AmountEffect.OnExecuted` **0x1826e0ab0**、`MightEffect.OnExecuted` **0x18270bf80** 和 `DealCountEffect.OnExecuted` **0x1826fd1b0** 调用效果的虚方法取得修改后数量。Amount/Might 的 `_isPermanentGain=false` 路径调用 `SimpleStat.AddValue`。

原生工作线程已进一步确认当前 PlayerStats 实例中的 Might/Amount/DealCount 会在战斗结束时复位，Might/Amount 的回合 decay 为 0。因此这些卡牌是本场战斗增益；地图护腕使用的跨战 `AddRunValueModifier` 是另一条路径。护腕卡牌修改后续发牌数，并在有限手牌模式增加手牌上限至模式上限，**不立即执行抽牌**。

`GainManaEffect.OnExecuted` **0x182700a50** 调用该效果修改数量方法；本轮已读取 `evidence/levels-v7-native/0x1827008a0.c` 的 override：未启用连击时返回基础 `_gainAmount`，启用时进入通用修改/连击路径。四本书的 `_isKaromasMana` 均为 false，不走 Karoma 特殊替代数量路径。既有用户实战日志的调用 34/36 显示轻薄之书/厚重之书在连击 2/3 时法力净变化 +3/+7，与“先扣费，再获得基础法力×连击”一致；此相容性不单独覆盖所有宝石/特殊规则。

## 未直接接入的候选

- 愈伤番茄/愈伤番柿：费用 1/2，`RecoveryEffect` +1/+2。不能当作即时 Heal；治疗时机和持续范围需另行确认。
- 永恒之心：费用 2，`MaxHealthEffect` +1。当前生命值是否同步变化须原生验证。
- 王冠：费用 1，`GrowthEffect` +15 后 `DestroyEffect`。不能直接当作获得 15 XP；需配合成长/经验结算与销毁规则。
- 小红心：费用 0、Heal 1、Destroy、pickup=true、正常奖励池=false。
- 聚星宝珠：费用 0、Draw 1、Destroy、pickup=true、正常奖励池=false。
- 原始法力：费用 0、GainMana 3、Destroy、正常奖励池=false，配置不接收连击倍率。
- `Card_S_2_Attractorb`：费用 2、Draw 2，但英文名 `[NOT USED]`，默认未解锁且奖励池=false；不可为增加抽牌种类而冒充原版正常奖励牌。

生成断言已验证：11 个接入候选、15 个证据候选、完整对象哈希/宝石槽数据、全部 maxLevel=0、原始费用和值及被禁用抽牌候选标记。

引擎现已合并 11 张牌并注册宝石槽别名。主效果先执行，之后执行附加宝石效果；新增护甲牌按原始连击旗标放大，附加护甲宝石仍固定 +2。新增卡牌预览提供 manaGain/mightGain/amountGain/dealGain。护腕只提高后续发牌数，有限手牌上限最多提高至 7；已有高于 7 的原型测试/自定义上限不会被降低。

`tests/cards-v7.test.cjs` 的 6 项测试涵盖精确配置、宝石限制、先扣费再回蓝、费用不足原子拒绝、连击增益、攻击预览、回合保留/新战斗清除、附加宝石顺序、护腕延后抽牌和保存恢复后确定性。
