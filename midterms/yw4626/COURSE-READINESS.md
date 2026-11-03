# Midterm submission audit — 2026-11-02

Source of requirements: the user-provided 14-page assignment PDF, especially pp. 3–6 and 8–11. This audit checks local project artifacts and recorded results; it does not verify remote GitHub, CourseWorks, or private peer communications. Missing evidence means not verified here, not proof an external activity never happened.

## What has been built

- Duskvault: a bounded, five-floor first-person card dungeon with character selection, seeded exploration, combat, victory/failure, progression, shops, loot, gems, supported evolution recipes, saves, and English/Chinese UI.
- A human tutorial using real gameplay: movement, actual hedge turns, bump collection, ascending-cost combos, merchant purchases/socket expansion, gem chest/socketing, optional removal, guardian combat, level-choice/free-card guidance, and a prepared evolution recipe before the campaign transition.
- Original prototype adaptations include five themed floors, distinct guardian mechanisms, sequential vampire summons and blood-blade finale. These are intentional design choices, not all verified source-game behavior.
- Unified pixel presentation, audio/effects, camera and entity feedback, developer inspection, and AI spectating/replay. Recent rendering optimizations preserve benchmark frame hashes; actual target-browser smoothness is not established by that offline benchmark.
- Extensive source/config/runtime evidence documents covering card costs, combo behavior, targeting, area effects, progression, gems, evolution, maps and enemies. These need a concise final rule/source index.
- Shared five-operation player API, scripted baseline, live Vertex Gemini adapter, bounded runner, frozen suites, traces, version manifests and replay validation.
- Six English reusable skill packages in ../reusable-game-skills: game-rule-reconstruction, game-tutorial-flow, pixel-game-ui-polish, game-event-animation, game-agent-evaluation, game-render-performance. Installed copies are local conveniences, not course-repository submission evidence.

## Evidence by requirement

| Requirement | Current evidence | Remaining work |
|---|---|---|
| Complete playable loop (2a) | Five-floor game; archived v29 script regression 6/6 wins; tutorial tests for four characters | Freeze the submitted version and run a clean end-to-end verification on it. Do not present historical runs as current-build runs. |
| Rules, scope and sources (1a–c) | Native/config evidence files, README, THIRD_PARTY_ASSETS.md | Consolidate an index with code/manual/observed/assumed/design labels and locators; state omissions and adaptations; check public redistribution terms for every included asset and source-derived item. |
| Player and information boundary (2b–c, 3b) | agents/environment.cjs, protocol.md, scripted.cjs, gemini.cjs, player API tests; explicit limits and failure reasons | Keep the submitted contract and tests aligned with the final build. |
| Live comparison (4b, 5a) | FULL_EVALUATION.md: three starts × two real Gemini trials, 5 wins and one fifth-floor timeout; matching baseline 6/6; all 12 traces replay-validated | The live suite predates later gameplay changes. Declare/freeze the final protocol and rerun affected baseline/model comparisons, or clearly separate the evaluated archived version from the current build and explain the limitation. |
| Memory/history experiment (5a) | Historical first-floor report compares no-history and bounded history, but started only 8/12 trials | Complete the missing holdout and interrupted comparison under an explicit versioned protocol, or explain the incomplete evidence. Five-floor bounded-history-only trials do not fill this gap. |
| Deterministic checks (3c) | Latest local log: evidence/exploration-performance-tests.txt, 419 passed | Local tests are not course CI. Install the scoped workflow and obtain a green run for the submitted commit. |
| Fresh-clone setup (3a) | package.json, README, local launch scripts and model config examples | Package under midterms/<lowercase-login>/; verify documented play/test/baseline/model setup from a clean clone without local tools, absolute paths or private config. |
| Implementation agent (3d) | AGENTS.md and development conversation | Link the implementation session from the PR and team log. |
| Reusable skill (3d) | Six new packages plus agents/skills/evaluate-players/SKILL.md; agents/skill-use.md records use in this conversation | Commit selected skills under skills/ or .codex/ in the submission. Invoke the same selected skill by name in at least two distinct sessions and keep links/results. Multiple turns or repeated uses in this chat are not two sessions. |
| Independent review (3d) | No independent reviewer findings found in inspected local evidence | A separate read-only reviewer/session that did not author the code must review it; commit findings and evidence links. Same-session self-checks do not qualify. |
| Student authorship (5b) | AGENT-TEAM.md exists but explicitly remains an assistant-generated scaffold | Student writes the one-page log and limitations in their own voice, with accepted/rejected recommendations and reasons. |
| Peer playtests (5b) | User feedback drove many changes, but no required classmate given/received notes found | Arrange a 15-minute classmate playtest; send notes by Nov 6; retain given/received evidence and show how it informed changes. Do not invent feedback. |
| Recording (5c) | Working spectator/replay support and screenshots | Record 3–5 minutes of game plus autonomous agent actions; explain limits; link viewable video from README and PR. Replay is useful material but not itself a recording. |
| Checkpoints and scope record | No verified Week 3 / Oct 19 / Oct 26 course evidence inspected | Supply actual links; update the Week 3 scope thread if direction changed. Report missing checkpoint evidence honestly, without backdating. |
| Course submission | Standalone working project; workflow template still uses YOUR_LOGIN; no verified submission PR here | One PR to course main containing only midterms/<login>/ and .github/workflows/midterm-<login>.yml; submit that PR URL on CourseWorks. |

## Keep experiment versions separate

1. Historical first-floor suite: baseline 6/6; model 6 completions from 8 started trials out of 12 planned. Includes a genuine gem-selection loop and HTTP 429. Missing holdout trials remain missing.
2. Five-floor live v3 suite: Gemini 5/6; scripted 6/6; 2,089 API requests, six failed requests, zero illegal actions, estimated USD 2.87584 for that batch. One final-floor network timeout is not a victory and must remain in the denominator. Earlier interrupted attempts and costs remain separately disclosed.
3. Later Boss v29 development regression: six script-only five-floor wins, zero illegal actions, no model API calls. This does not validate current Gemini performance.
4. Latest local regression: 419 tests passed. It is neither a new live experiment nor a remote CI run.

## Recommended finish order

1. Freeze feature scope and the final evaluation build; fix only blocking defects.
2. Assemble the course folder, concise README/rule-source map, asset notices and portable setup. Keep credentials, source-game binaries, installed dependencies and oversized generated artifacts out of the public PR.
3. Obtain independent review and the second distinct skill-use session; resolve findings with evidence.
4. Finish the final version's deterministic checks and fair player comparison, including an explicit history comparison and preserved failures. Do not silently retune held-out cases.
5. Complete classmate testing and student-authored reflection, then make the 3–5 minute recording.
6. Verify clean-clone setup and course CI, open/update the single PR, and submit its URL on CourseWorks by Nov 7, 11:59 p.m. as shown in the supplied PDF. Confirm the course deadline timezone in CourseWorks if needed.

Partner notes are due Nov 6. Separate recording-review replies for three assigned classmates are due before class Nov 16, after assignments on Nov 9; this is later course work, not a reason to delay the Nov 7 submission. No Asana artifact is required for the midterm.

## Historical status below

The following retained checklist describes an earlier build. Where it differs, use the dated audit above; do not reinterpret its historical test counts as current counts.

# Course requirement status

Source: user-provided *Midterm: build a game and an agent that plays it*, pp. 4–6. This is a factual implementation checklist, not a claim that the assignment has been submitted.

| Requirement | Status and evidence |
|---|---|
| Five authoritative operations | Implemented in `agents/environment.cjs`; contract and information boundary in `agents/protocol.md`. |
| Automated cheap competitor | `agents/scripted.cjs`; explores, opens/collects loot, fights, chooses rewards, buys/heals, sockets gems, evolves and changes floors. Only public input; local visited-service memory disclosed. |
| Model-driven player | Gemini Developer API + Vertex adapter implemented in `agents/gemini.cjs`; only public JSON and action ID. Vertex project `duskvault-game-agent`, education billing, model API and ADC are configured. |
| Live API evidence | **New five-floor batch complete:** six real Gemini attempts, five final-boss wins and one fifth-floor network interruption; 2,089 requests, estimated $2.87584 including missing-usage reservations. Matching scripted baseline: 6/6 wins; 12 traces replay-validated. See `FULL_EVALUATION.md`. The historic first-floor suite remains 8/12 started with its missing holdout trials, preserved in `EVALUATION.md`; do not combine their success rates. |
| Predeclared suite | Historic `agents/suite.json` was frozen Oct 31. New `agents/full-suite.json` v3 was frozen after the user-requested service-flow fixes and before the new live runs; three character/seed starts, two trials each, Arca held out. Auth transport recovery provenance and interrupted v2 remain explicitly recorded. |
| Memory experiment | No history vs last six public summaries: four trials started per mode, three successful each. One pair interrupted by 429; holdout missing. No overall memory-benefit conclusion is justified. |
| Limits / cost / failures | Primitive step, decision, call, wall-time and invalid-action guards; public repeated-state warning/limit; bounded HTTP retries recorded individually. Old $2 first-floor budget is retained historically. User explicitly lifted the cost cap for the finite new six-trial five-floor batch. No scripted fallback; missing usage is reserved and disclosed. |
| Local deterministic verification | **379 tests passed** after the v3 service-loop, gem-flow and credential fixes; `evaluation/full-v3-watch-local-validation.txt`. Older validation remains archived. |
| Genuine regression | Initial DEV-B merchant/removal loop retained. The later real v2 fourth-floor trace exposed repeated service cancellation and revisits with no compatible gem slots. v3 adds public service availability/deferral, filters non-actionable navigation targets and passes deferred services en route. `tests/service-progress.test.cjs`, `tests/gem-flow.test.cjs`; interrupted trace preserved. Credential startup timeout has its own tests and provenance. |
| Reusable instructions | `AGENTS.md`, `agents/skills/evaluate-players/SKILL.md`, `agents/player-prompt.txt`. One session use recorded; **second independent session still pending**. |
| Independent read-only review | **Pending** a reviewer/session that did not write this code. Same-author checking is not independent review. Store findings and evidence link. |
| Team log | `AGENT-TEAM.md` is a clearly marked template; **student must write decisions in their own voice** and supply session links. |
| Course CI | Template in `agents/ci.workflow.example.yml`; actual course-repository path/login, PR and successful remote run **pending**. No real CI pass is claimed. |
| Recording | In-game **观看 AI 游玩** button now follows live logged decisions or replays recorded episodes with pause, step and speed controls. It preserves manual saves and does not make model calls. **A separate 3–5 minute viewable recording remains pending**; screenshots and decision replay are not a video submission. |
| Peer testing | **Pending** actual given/received feedback; don't replace it with simulated opinions. |
| Submission | Complete project must go under `midterms/<lowercase-github-login>/`, plus its one scoped workflow. Branch/PR/push/CourseWorks submission **not performed**. |

Before submission, check redistribution rights of the original-game-derived content and each third-party asset against the existing asset manifest; the API work does not change their licenses or establish permission to redistribute them. Keep dependencies, test artifacts, game source and report inside the submission folder. Record omitted/approximated original mechanics and deliberate user-requested balance changes using the existing evidence documents.

Interpret the evaluation carefully: `EVALUATION.md` describes the historic first-floor suite. The new `agents/full-suite.json` separately evaluates all five floors with bounded history. This new suite does not fill the missing no-history/holdout comparisons of the old suite. Same-seed comparison controls the initial state, not identical trajectories after different moves. Human clarity/fun and browser rendering require separate playtests.
