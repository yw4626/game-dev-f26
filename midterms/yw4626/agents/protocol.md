# Player API v4

The five operations are `reset(seed)`, `observe('player')`, `legal_actions('player')`, `step('player', {id, revision})`, and `outcome()`. Instantiate `PlayerEnvironment` in `environment.cjs`. `reset` returns the first observation. All returned objects are detached JSON. Only the trusted runner holds the environment; the model receives JSON, with no tools, file access, shell, repository, seed, RNG state, saved games or evaluator results.

Legal actions contain an opaque `id`, current `revision`, action `type` and public argument. `step` accepts exactly `id` and `revision`. Stale, malformed and unavailable actions consume a decision/invalid allowance but cannot mutate game state. Accepted navigation can legitimately stop on the way to its destination. `observe` is an allowlist, never a serialized Run. Hidden state cannot be accessed by changing player_id. There is one player; enemies are engine controlled.

Actions cover movement/turning, navigation to visible markers, playing a card, ending turns, level/boss rewards, evolution, gem selection/socketing, shop purchases/healing/refresh/socket expansion, camp rest and card removal. Navigation is a shared convenience macro: shortest public path, stopped at first encounter/object/service, individual movement counted. It cannot bypass a fight. Both competitors receive it. Enemy actions and digging animation ticks resolve deterministically in the engine; they count as steps but not model decisions. Attack targets are automatic, matching the human game.

Public data: complete current-floor map geometry/markers (the human map has no fog), current hand with the same derived effect previews, deck collection, pile counts, discard identities, living enemies and current intents, visible reward choices/shop stock, player stats. Sealed containers expose only type; their rewards appear after opening. Future-floor maps, deck order, RNG, enemy intent tables/weights, future shop rolls and unrevealed offers are excluded. Draw order and future events make the environment partially observed even though its map is revealed.

The model adapter runs externally over HTTPS without tool declarations. The heuristic module imports no engine and gets the same serialized observation/actions. This is an input boundary for supplied policies, not a sandbox for arbitrary malicious local JavaScript. Never load an untrusted plugin into the evaluator process.

The formal first-floor objective ends after defeating the guardian, taking its reward and entering floor 2. Game mechanics and five-floor human gameplay are unchanged. `goalFloor:6` evaluates a full run. Scoring: 1000 per completed floor + 100 per battle victory + 5 per kill + 10 per character level; terminal success is the primary metric, score secondary. Termination includes victory, death, step/decision/invalid limits; runner additionally enforces call, time and cost limits, provider failures and missing legal actions.

Source map: engine transitions and card effects = **code** (`dist/run.js`, `dist/engine.js` and their catalogs); five-operation contract = **manual** (course PDF); navigation macro, limits, score, evaluation objective and heuristic = **design**. These evaluation conventions are not claims about the original Vampire Crawlers implementation. Existing reconstruction assumptions remain documented in the project's evidence files.


## Gem flow and trusted spectator (v2)

Gem rewards have explicit `choose_gem` and `choose_card` stages. Selecting a gem does not claim it. The current gem selection is not offered again as a legal action; compatible socket actions come first and include detached before/after modifier and socket-use previews. Other gem choices and cancel remain available. The authoritative Run still performs compatibility checks and consumes the reward exactly once after attachment.

An optional trusted renderer callback receives cloned private Run snapshots for local spectator rendering. It is never passed to a policy and is not exposed through observe/legal_actions. The read-only preview API replays recorded actions, without model calls, and the browser preserves the manual save while watching.

`agents/suite.json` remains the historic first-floor protocol. `agents/full-suite.json` declares the new six-trial, five-floor protocol (bounded history only), separately frozen before live calls. Old v1 source is archived at `evidence/player-v1-source/`; old reports are not merged into v2 scores.


## v3 service progress and loop bounds

Map markers expose durable service status from the player's own visits and current deck/resources: `visited`, `deferred`, `available`, and a reason. No unopened offers or sealed loot are revealed. A cancelled gem/removal service is deferred while the relevant deck fingerprint is unchanged; acquiring cards or changing sockets re-evaluates it. Shops re-evaluate after deck, gold or health changes. Human map tooltips show the same availability; manual bumping can still deliberately reopen a service.

The navigation convenience action lists only unfinished, actionable markers, with destination type and distance. It no longer offers completed rooms or unchanged deferred/unavailable services as destinations. While en route to another target, the authoritative Run movement may pass a declined/unavailable optional service; enemies and loot still interrupt movement. Primitive movement remains available. `lastAction` reports whether navigation reached its destination, and the map exposes the current boss/exit objective from already-visible markers. Both script and model use this interface.

The full v3 runner tracks only repeated PUBLIC noncombat state (position, phase, deck, gold, health and progress). At four occurrences in a rolling 128-decision window it adds an explicit warning; at 16 it records `repeated_state_limit`, a failure, without a scripted takeover. Combat/level-up observations are excluded. Retry limits are declared in `full-suite.json`: 30-second requests, up to four retries starting at 5 seconds (maximum 60). In-flight request starts are logged separately. These are operational limits, not evidence of successful play.

The earlier v2 live run was explicitly interrupted at the user's request for fixes. Its 674 decisions and 678 completed request records are retained, not silently overwritten. Confirmed/logged estimate $0.8170658 plus one possible in-flight request with unknown usage. Five v2 trials never started. New v3 baseline and model trials restart independently with the same fixed seeds and new hashes.


## v4 authored Boss mechanics (v28)

`battle.bossMechanics` is an explicit public allowlist: current counters, active bosses/helpers, seal colors, windup progress, plague, ritual status, echo activation countdown and announced actions. Every hand/deck card also exposes `mechanicColor`, derived from the displayed card type. No new draw order, RNG, weights, future map or sealed loot is exposed. The same source (`boss-rules.js::publicState`) supplies the human skill bar.

The heuristic prioritizes a missing book-seal color (W counts at most once), attack **cards** during the prison windup and healing while plagued. The model prompt documents the same rules; this is interface/prompt support, not evidence that a new live model has mastered them. All five mechanics are **design** requested by the user, not reverse-engineering claims.

`npm run agent:boss` runs six script-only development episodes, three characters across AGENT-DEV-A/B, then replays their recorded actions. It never instantiates a model policy and does not read a live-model config. Historical v3 suites/results remain unchanged. Final v28 results: evaluation/full-boss-v28-2026-11-01T15-49-58-815Z-scripted/REPORT.md. Do not compare these wins directly to v3 model scores: both engine and policy changed.


## v29 final vampire phase

`battle.bossMechanics` additionally exposes `bleed`, `bloodFury` and public `rules` values (2 bleed per unblocked HP-damaging hit, cap 6, end-turn tick then decay 1, immediate healing cleanses 1). Phase protection lasts until the card clearing all echoes finishes; vampire then becomes killable. Player prompt documents these values. Presentation remains independent of the headless engine. Script policy remains unchanged from v28; it can read these fields, but no dedicated bleed-priority policy or new live-model evaluation is claimed.
