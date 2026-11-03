---
name: evaluate-players
description: Validate the Duskvault player boundary and produce reproducible paired baseline/model evaluation evidence.
---

1. Read `agents/protocol.md` and the frozen `agents/suite.json`; never tune on its held-out case. Work on development seeds first.
2. Check that observations and legal actions contain no hidden draw order, sealed loot, RNG, future events or repository paths. Verify copies cannot mutate authoritative state.
3. Run deterministic tests including the observed DEV-B merchant/removal loop regression and step/call/invalid/timeout limits. Record the actual local command and outcome. Remote CI requires its own evidence.
4. Freeze engine/interface/prompt/adapter hashes. Run baseline and real model with identical suite. Require configured local credentials and an explicit monetary budget for live calls. Never print credentials. Preserve failed calls and label mock and replay data.
5. Compare bounded public history versus no history. Report missing trials, failures, latency, tokens (including thinking), dated pricing and cost uncertainty. No fallback actions disguised as model actions.
6. Replay recorded actions against the same engine version and generate `EVALUATION.md`. Treat the first-floor suite and full-five-floor smoke test as different scopes. Document limitations and outstanding human course artifacts.
7. Add a factual entry to `agents/skill-use.md` identifying this session and what was executed. A single long session cannot count as two separate uses.
