> 新的五层实验已完成：Gemini 6 次真实试跑中 5 次通关、1 次第 5 层网络中断；脚本基线 6/6 通关。见 [五层完整实验报告](FULL_EVALUATION.md)。本文件仍是此前第一层实验的历史结果，不合并胜率或重置费用。

# Duskvault 同种子玩家对比报告

> 历史 v1 第一层报告。用户随后对指定六局五层实验解除费用上限，并要求修复服务循环后重测；v2 中断记录保留，当前为独立 v3 套件，不能把本页历史预算/胜率当成新一组结果。

本次已完成真实 Vertex Gemini 试跑，但**尚未完成全部课程评测要求**：计划 12 个模型试次，实际启动 8 个；HTTP 429 导致提前停止，留出的 Arca 起点 4 个试次尚未运行。没有隐藏重试、脚本接管或删除失败试次。

## 主要结果（中文）

| 玩家 | 已启动 / 计划 | 达成第一层目标 | 其他结果 | 估算 API 费用 |
|---|---:|---:|---|---:|
| 脚本玩家 | 6 / 6 | 6 | 非法动作 0 | $0 |
| Gemini：仅当前观察 | 4 / 6 | 3 | 1 次达到 400 决策上限 | $0.76751 |
| Gemini：最近 6 步公开历史 | 4 / 6 | 3 | 1 次 HTTP 429 中断 | $0.50149 |

目标是从第一层开局，探索、战斗、领取奖励、击败关底守卫并进入第二层；这不是五层模型通关测试。另有此前脚本五层开发种子通关记录，不能当作模型结果。

共发起 **1,482 次 API 请求**，1 次失败；已报告输入 **4,082,424 tokens**、输出 **12,540 tokens**、思考 0。平均决策调用延迟 **837 ms**，p95 **945 ms**；整组约 **20.7 分钟**。全部模型试次非法动作数为 **0**。总成本估算 **$1.26900 / $2**，其中 HTTP 429 缺少 usage，按规则保留 **$0.0129188** 的保守预留；已报告 tokens 对应约 $1.25608。这里不是云账单确认值，后续重跑须从剩余约 **$0.73100** 的测试预算计算，不能重新得到另一个 $2。

**真实失败案例：** Imelda 第二次无记忆试跑在宝石流程中没有完成镶嵌。决策索引 120–399 的 280 次动作包括 98 次 `gem:free`、148 次 `gem:draw`、17 次取消、17 次重新走回同一宝石位置。最终 400 次决策耗尽，生命仍有 49；这是合法动作重复而无法推进，并非战斗死亡。最终观察已提供选中宝石和 4 个可镶嵌目标。正式评测中未修改提示词或接口来消除失败。

**记忆对比的限度：** Antonio 两次同种子复测，带历史模式分别用了 159、138 次决策，无历史模式为 174、182 次；但带历史的第二局少打了一场可选战斗（分数 1790 对 1990），不能把差异全部归因于决策效率。Imelda 第一次分别为 148 与 226 次；第二次带历史被限流打断，无法完成配对。缺少整个留出起点，不能声称记忆总体显著改善性能。脚本在已测起点完成目标所需决策更少，但其内置启发式与公开位置访问记忆是额外设计假设。

游戏、玩家接口、提示词、适配器和运行器的冻结 SHA-256 与基线一致。**8 条模型轨迹全部逐步重放通过**，包含循环失败和限流前的合法状态：见 [重放校验](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/replay-validation.json)。重放仅验证记录一致性，不计为新的模型试跑。此前 363 项本地自动测试通过，本轮只修改配置、证据与报告，未改冻结程序。

## 云项目与后续缺口

已创建 [Duskvault Game Agent](https://console.cloud.google.com/home/dashboard?project=duskvault-game-agent)，关联课程教育结算账户，确认 $100 教育额度到账、有效期至 2027-09-30；已启用 `aiplatform.googleapis.com`（控制台现名 Agent Platform API），恢复本机 ADC，计费项目为 `duskvault-game-agent`。本地配置 `agents/gemini.local.json` 已忽略提交，不含密钥。凭据不进入日志、报告或浏览器游戏代码。

待完成：限流恢复后的明确补测（保留本次失败、分配新的 attempt 编号并累计预算）；Arca 留出起点的两种模式各两次；独立只读评审、另一次独立会话技能使用、真实课程 CI、同伴反馈、学生本人撰写团队记录、3–5 分钟演示及课程仓库提交。详见 [课程状态](COURSE-READINESS.md)。本次没有提交作业。

以下为工具生成的完整配置、逐试次指标和证据索引。

# Evaluation — paired-comparison

Generated 2026-11-01T04:07:50.937Z. Game package 0.27.0. Suite midterm-v1-frozen-2026-10-31.

## Scope and predeclared design

Complete floor 1: explore, fight, choose rewards, defeat guardian and enter floor 2. The playable game remains five floors.

Three frozen starts, two fresh episodes per start; one held-out case. Development seeds are separate. The deterministic baseline repeats check reproducibility, not independent statistical samples. Model modes: current observation only and last 6 public decision summaries. Same engine, observations, action legality, start seeds, step limits and navigation macro. The heuristic also retains its own visited-service coordinates from public observations; this asymmetric policy memory is disclosed. A full five-floor test is a separate smoke test, not the primary suite.

Limits: 1200 engine steps, 400 decisions, 400 attempted model decisions, 5 illegal actions; 45000 ms per call and 1800000 ms per episode. No fallback, no hidden retry. Provider/timeout failures terminate and count as failed calls. Invalid JSON is recorded and consumes an invalid action.

## Actual results

Baseline completions: 6/6. Live-model completions: 6/8.

Live rows are fresh API calls. Results are small-sample observations, not a statistical performance guarantee.

| Case | Trial | Player/memory | Terminal reason | Score | Steps | Decisions | Illegal | Calls/failed | Mean latency ms | Input/output/thinking tokens | Est. USD |
|---|---:|---|---|---:|---:|---:|---:|---|---:|---|---:|
| garden-whip | 1 | scripted/stateful-public-history | goal_reached | 1990 | 140 | 102 | 0 | 0/0 | 0.1 | 0/0/0 | 0.00000 |
| garden-whip | 2 | scripted/stateful-public-history | goal_reached | 1990 | 140 | 102 | 0 | 0/0 | 0.0 | 0/0/0 | 0.00000 |
| garden-mage | 1 | scripted/stateful-public-history | goal_reached | 2010 | 123 | 78 | 0 | 0/0 | 0.0 | 0/0/0 | 0.00000 |
| garden-mage | 2 | scripted/stateful-public-history | goal_reached | 2010 | 123 | 78 | 0 | 0/0 | 0.0 | 0/0/0 | 0.00000 |
| garden-fire-holdout | 1 | scripted/stateful-public-history | goal_reached | 1990 | 93 | 58 | 0 | 0/0 | 0.0 | 0/0/0 | 0.00000 |
| garden-fire-holdout | 2 | scripted/stateful-public-history | goal_reached | 1990 | 93 | 58 | 0 | 0/0 | 0.0 | 0/0/0 | 0.00000 |
| garden-whip | 1 | gemini/none | goal_reached | 1990 | 192 | 174 | 0 | 174/0 | 774.4 | 454750/1473/0 | 0.14011 |
| garden-whip | 1 | gemini/bounded | goal_reached | 1990 | 180 | 159 | 0 | 159/0 | 786.9 | 501396/1383/0 | 0.15388 |
| garden-whip | 2 | gemini/none | goal_reached | 1990 | 203 | 182 | 0 | 182/0 | 809.1 | 495247/1489/0 | 0.15230 |
| garden-whip | 2 | gemini/bounded | goal_reached | 1790 | 159 | 138 | 0 | 138/0 | 799.6 | 405563/1233/0 | 0.12475 |
| garden-mage | 1 | gemini/none | goal_reached | 2020 | 244 | 226 | 0 | 226/0 | 768.8 | 595596/1903/0 | 0.18344 |
| garden-mage | 1 | gemini/bounded | goal_reached | 2020 | 170 | 148 | 0 | 148/0 | 783.5 | 511740/1347/0 | 0.15689 |
| garden-mage | 2 | gemini/none | decision_limit | 600 | 416 | 400 | 0 | 400/0 | 953.3 | 945395/3219/0 | 0.29167 |
| garden-mage | 2 | gemini/bounded | http_429 | 390 | 58 | 54 | 0 | 55/1 | 945.4 | 172737/493/0 | 0.06597 |

## Reproduction and evidence

The adjacent manifest.json freezes seed suite, model/configuration, limits and SHA-256 hashes. results.json contains p95 latency and missing-usage counts. traces/*.jsonl contain every public model input, chosen action, provider metadata and engine outcome; no credentials or private engine state. Replay is a deterministic validation of the recorded actions, not a new live trial.

Hashes:

```json
{
  "game": "d34cfb7ea9fde5265a1e2e366ad7deda82306be2c3f88b6c4fa7cb8e3e7a92d9",
  "suite": "4811dcf6564145d2ad31b963d7df8afafffdc67db8e186a75aa4511066e126ad",
  "interface": "9f6fe1bfebb767a2d65d38f9e437677d119511ec9a2756196cdebb38dce4ad43",
  "baseline": "1fdbfef64cfc9164b1739b5ee161e2b27522bdfa3273129421057b79ce3ac8a0",
  "prompt": "3c0fee8a00866aa0b8109c4772ea87f31d072bdba804c0c17d90def820c3c1f1",
  "runner": "3459cd3eeb11164546cb6f5ebb446ee69db50aa9701d53af767cc194a9a213ae",
  "adapter": "641c1408407c7f1d4bcaa4aa7e1f244d5df5ec85b86e9d097aff35943729db58"
}
```

Pricing: {"date":"2026-10-31","source":"https://cloud.google.com/model-garden/pricing","inputPerMillionUSD":0.3,"outputPerMillionUSD":2.5,"note":"Vertex global Standard list prices, per million tokens; output includes reasoning. Non-global pricing differs. Verified from official pricing page on 2026-10-31. Recheck before future runs."} Costs include thinking tokens. If usage is unavailable after a sent request, retain the conservative preflight reservation and mark usageMissingCalls; do not claim the request was free. Cached inputs are conservatively charged at standard input rates. Budget estimates are not a provider-side hard billing cap.

## Limitations and remaining course evidence

Evaluation covers first-floor decisions, not complete five-floor model mastery. It uses structured state and omits visual/perceptual and animation latency. Success does not measure fun, clarity, or faithfulness to the original game. Seed matching cannot force identical RNG trajectories after policies take different actions. The suite was declared on October 31, not retrospectively at the October 19 checkpoint. No remote CI result, peer feedback, independent review, two-session skill-use proof, user-authored team log, or 3–5 minute recording is fabricated. See COURSE-READINESS.md for outstanding submission artifacts. Local tests are recorded separately; remote course CI remains pending.

## Memory comparison

- Gemini none: 3/4 completed; planned 6 trials.
- Gemini bounded: 3/4 completed; planned 6 trials.

Do not infer a memory benefit when trials are missing or configurations differ. Baseline repetitions are deterministic controls.

## Trace links

- [garden-whip, trial 1, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-whip-1-stateful-public-history.jsonl)
- [garden-whip, trial 2, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-whip-2-stateful-public-history.jsonl)
- [garden-mage, trial 1, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-mage-1-stateful-public-history.jsonl)
- [garden-mage, trial 2, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-mage-2-stateful-public-history.jsonl)
- [garden-fire-holdout, trial 1, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-fire-holdout-1-stateful-public-history.jsonl)
- [garden-fire-holdout, trial 2, scripted/stateful-public-history](evaluation/2026-11-01T03-22-47-470Z-scripted-suite/traces/garden-fire-holdout-2-stateful-public-history.jsonl)
- [garden-whip, trial 1, gemini/none](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-whip-1-none.jsonl)
- [garden-whip, trial 1, gemini/bounded](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-whip-1-bounded.jsonl)
- [garden-whip, trial 2, gemini/none](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-whip-2-none.jsonl)
- [garden-whip, trial 2, gemini/bounded](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-whip-2-bounded.jsonl)
- [garden-mage, trial 1, gemini/none](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-mage-1-none.jsonl)
- [garden-mage, trial 1, gemini/bounded](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-mage-1-bounded.jsonl)
- [garden-mage, trial 2, gemini/none](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-mage-2-none.jsonl)
- [garden-mage, trial 2, gemini/bounded](evaluation/2026-11-01T03-46-50-261Z-gemini-suite/traces/garden-mage-2-bounded.jsonl)
