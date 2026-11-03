# 统一玩家接口与 Gemini 评测

工作目录：提交后的 `midterms/<github-login>/`，即当前游戏项目根目录。依赖 Node.js 22+（内置 fetch，无需安装 npm 包）。原来的 `npm start` 和浏览器游戏不受影响，自动评测创建独立 Run，不读取或覆盖玩家存档。

## 本地运行

```powershell
npm run test:agents
npm run agent:dev
npm run agent:baseline
npm run agent:full
```

电脑没有把 Node 加入 PATH 时，可直接运行：

```powershell
& '..\tools\node-rea\node-v24.22.1-win-x64\node.exe' agents/evaluate.cjs --player scripted
```

baseline 使用预先固定的三个起点、每个两次。full 是单独的五层开发种子通关检查。每次在 `evaluation/<时间戳>-<玩家>/` 生成 manifest、results、逐步 JSONL 日志和报告。模型对比是第一层到第二层入口的完整短任务，游戏本身仍有五层。见 [接口协议](protocol.md)。

## Gemini Developer API

可以使用 Gemini。需要 Google AI Studio 的 **API key**，Gemini 网页登录/会员本身不是 API 凭据。官方入口：[API keys](https://aistudio.google.com/app/apikey)，[价格](https://ai.google.dev/gemini-api/docs/pricing)。模型 ID 和项目额度以你的账户实际可用情况为准。

1. 复制 `agents/gemini.example.json` 为 `agents/gemini.local.json`。它只包含模型、预算和价格，不能填写 key。默认预算 $2 是示例；运行真实评测前自行确认。
2. 在同一个 PowerShell 窗口安全输入 key，再启动 Node。输入不回显，不写入仓库：

```powershell
$secret = Read-Host 'Gemini API key' -AsSecureString
$env:GEMINI_API_KEY = [System.Net.NetworkCredential]::new('', $secret).Password
npm run agent:gemini
Remove-Item Env:GEMINI_API_KEY
```

使用内置 Node 时，把 npm 那行换为：

```powershell
& '..\tools\node-rea\node-v24.22.1-win-x64\node.exe' agents/evaluate.cjs --player gemini --config agents/gemini.local.json
```

不要把密钥发到聊天或放进网页代码。模型请求由本机 Node 发出；游戏状态和行动记录会发送到所选 API。没有上传游戏源码、存档或账号信息。

完整计划为 3 起点 × 2 次 × 2 记忆模式 = **12 次真实模型游戏**。相同地图种子不保证模型回答相同。预算不足、限流或认证失败会停止，并保留已完成/失败记录；不会伪造其余结果。默认价格为 2026-10-31 查阅的标准付费标价，免费额度实际账单可能为零。估算不是云平台账单的绝对上限，可同时设置云平台预算提醒。

## 课程 Vertex AI 额度

也支持 `provider: "vertex"`。配置中增加 `project`（课程项目 ID）和 `location`（例如 `global`），保留可用的 Gemini 模型 ID；**把 pricing 改为对应 Vertex 标价与日期**，不要混用 Developer API 价格。安装课程指定 Google Cloud CLI 后，在本机执行：

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_COURSE_PROJECT_ID
```

随后同样运行 `agent:gemini`。适配器通过 gcloud 获取短期 ADC access token，保存在进程内；不会记录 token。学校项目权限、可用区域和模型需由课程项目实际配置决定。官方：[ADC](https://docs.cloud.google.com/docs/authentication/application-default-credentials)。

## 对比与重放

```powershell
npm run agent:compare -- evaluation/BASELINE_DIRECTORY evaluation/GEMINI_DIRECTORY
npm run agent:replay -- evaluation/BASELINE_DIRECTORY/traces/garden-whip-1-stateful-public-history.jsonl
```

对比命令检查 suite、游戏、接口、策略与模型配置版本，拒绝混合不同版本和重复试次。生成根目录 `EVALUATION.md`。重放逐步核对观察、合法行动及结果，不消耗 API；**它不是新的模型试跑**。首次只有基线时，报告会明确标注 Gemini 尚未运行。

模型只返回 `{"action":"play:3"}` 这样的行动 ID。运行器持有私有游戏状态，校验 revision 和合法行动后推进。抽牌堆顺序、未开箱掉落、未来敌人意图和其他楼层不进入模型输入。脚本玩家也只用这些公开数据，另记访问过的服务位置。日志中保存完整公开输入，可以核验公平性。

## 课程证据

参见根目录 `COURSE-READINESS.md`。没有真实 API 结果、远程 CI、独立审查和人工课程材料时，不能称整个作业已完成。`AGENT-TEAM.md` 需要学生本人补写，不应把机器生成的模板当作自己的决策反思提交。


## 新版六局五层实验与观战

`agents/full-suite.json` 是宝石接口 v2 后单独冻结的完整五层协议：Antonio、Imelda、Arca 三个种子各两局，使用最近 6 步公开历史。它不替代上述旧版第一层记忆对比，也不把旧版失败删除。旧 v1 源码保存在 `evidence/player-v1-source/`。

```powershell
npm run agent:full:baseline
npm run agent:full:gemini
node agents/full-report.cjs evaluation/FULL_SCRIPTED_DIRECTORY evaluation/FULL_GEMINI_DIRECTORY
```

完整实验使用 `agents/gemini.full.local.json`。本次用户对指定六局明确解除金额上限，故配置 `budgetUSD: null`，仍记录 tokens、费用及所有失败，限制决策/步骤/请求次数和运行时间。以后新的付费批次须自行确认授权；正常有限预算应填写正数。不要在此 JSON 填入密钥。

`npm start` 后打开 http://127.0.0.1:8765/ ，点击顶部“观看 AI 游玩”。实验记录可区分脚本与 Gemini，可切换试次，播放、暂停、单步、跳转或追踪最新日志。观看只在本机重放真实动作，不调用模型；它把每次决策拆为逐格移动、出牌、敌人逐个行动、拾取及奖励选择，复用手动游戏动画；这属于动作日志的动画重建，不是逐帧录屏。暂停在当前动作结束后生效，跳转直接定位状态。退出后恢复手动存档。浏览器直接双击 HTML 无法连接观战服务，应使用本地地址。

宝石流程现在是“选择宝石 → 选择兼容卡牌完成镶嵌”，预览显示实际修正值和槽位变化；选择宝石不消耗奖励。当前选中项不再作为智能体的重复合法动作。兼容限制与奖励消耗仍由游戏引擎检查。


v3 更新：取消过的服务会标记暂缓，无兼容卡牌的宝石不可选，地图导航不再推荐已完成地点。新牌或扩槽后会重新评估。导航可穿过已暂缓的沿途服务，普通手动碰撞仍可重访。观战等待同一步时不再反复重建画面；API 退避等待会显示状态。旧版本日志根据游戏与接口哈希匹配归档源码重放，并标记“归档规则”；结算不一致时停止，不用新规则改写旧实验。

`full-suite.json` 已更新为独立 v3 协议；v2 中断记录在 `evaluation/full-2026-11-01T04-43-38-014Z-gemini/`。新报告必须包括这次中断的已知费用和未知在途请求，不得把重跑当成预算归零。


凭据修复：Vertex 在批次开始前验证 ADC，读取 CLI 的超时为 45 秒，有效令牌仅在进程内按项目缓存 45 分钟，多局共享，不落盘、不记日志。`--resume-from evaluation/PREVIOUS_GEMINI_BATCH` 仅在游戏、接口、提示词、脚本、套件和停滞规则哈希一致时使用：保留所有已玩过的结果（包括失败）；仅重试 0 决策且每个请求都标记 `attempted:false` 的认证初始化失败。保存原批次、传输哈希和逐局来源，不覆盖任何日志，也不重复计费/计数已保留局。


最新完成结果：见 [五层完整实验报告](../FULL_EVALUATION.md)，6 次真实模型试跑中 5 次通关、1 次网络中断，脚本 6/6；379 项本地检查及 12 条轨迹重放通过。只读观战服务允许状态文件正在更新，并等待完整 UTF-8 日志行后再解码。实验已经结束，观看这些记录不会发出新的模型请求。
