# Independent read-only review — 2026-11-02

Reviewer: separate delegated agent session `/root/final_readonly_review`. This reviewer did not implement the game, did not participate in the separate second Skill-use task, and made no changes to game, player, runner, configuration or tests. The sole written artifact is this review. This is an agent review, not a human peer playtest.

Scope: current working copy of `vampire-crawlers-prototype`; five-operation public boundary, evaluation runners and accounting, save/restore, final victory, replay and packaging readiness. Findings describe the existing runners inspected before the planned final wrapper is implemented. A new wrapper can resolve these without rewriting historical results.

## Findings

### R1 — P1: cumulative final budget is not enforced across suites or process restarts

Locations: `agents/full-evaluate.cjs:66`, `agents/evaluate.cjs:96`, `agents/gemini.cjs:36`.

Both command-line entry points initialize a new in-memory `{spentUSD:0}` ledger. The adapter correctly reserves conservative cost against that ledger, but launching the full suite and memory suite separately gives each invocation a fresh budget. A crash also loses the live reservation unless recovered externally. Setting each config to $10 does not enforce the user's $10 cumulative authorization.

Required before live final trials: one durable final-batch ledger shared by both protocols, persisted before sending a request and reconciled after usage, retaining uncertain in-flight reservations on restart. Reject concurrent writers or serialize requests. Test interruption/restart and cross-suite budgeting. Historical runners may remain explicitly historical.

### R2 — P2: scripted full-run command depends on excluded local model configuration

Location: `agents/full-evaluate.cjs:63` (exported as `agent:full:baseline` in `package.json`).

The command reads `agents/gemini.full.local.json` before checking whether the selected player is scripted. That file is intentionally ignored by `.gitignore`; a clean clone cannot use this baseline command without model configuration. No credentials should be needed for deterministic baseline/CI.

Required: the final scripted command must neither load a local model config nor initialize authentication. Update final README commands and exercise from a clean directory without either local config.

### R3 — P2: full runner writes unfiltered local config to public evidence

Locations: `agents/full-evaluate.cjs:63-65`; compare allowlist at `agents/evaluate.cjs:86-87`.

The full runner serializes the entire local config into manifest.json, unlike the first-floor runner which rejects unknown fields. `GeminiPlayer.validateConfig` validates required fields but does not reject extra properties. If a user mistakenly puts a key/token in that JSON, the full manifest would retain it. No actual secret was inspected or found in this review.

Required: validate allowed configuration fields before creating output, construct a public configuration explicitly, and test rejection/redaction using a fake marker credential. Scan packaged evidence, not just ignored input files.

### R4 — P2: final report and request counts can misrepresent a budget stop

Locations: `agents/full-evaluate.cjs:9`, `agents/full-evaluate.cjs:34-36`.

The existing report hardcodes an unlimited-dollar authorization from the historical experiment. Also, `runEpisode` increments `calls` before choosing and increments failedCalls for every exception, including a `cost_limit` error marked `attempted:false`. Thus a rejected preflight reservation is reported as a failed API request although no request was sent.

Required: final report must use the current $10 protocol, distinguish attempted HTTP requests from preflight failures, preserve both categories, and list unstarted episodes separately. Keep old reports unchanged.

### R5 — P2: replay checks decisions but does not verify terminal result metadata

Location: `agents/replay.cjs:18`.

The replay validates observations/actions/intermediate outcomes, then returns the last record's reason without comparing the finish result with reconstructed engine state. A modified finish success/reason can pass replay despite contradicting the replayed game. Externally stopped episodes legitimately differ in terminal/reason, so unconditional equality would also be wrong.

Required: validate a finish record exists; compare core engine fields and success for game-ended episodes, and allow only documented external-stop overrides with corresponding request/limit evidence. Test a tampered terminal success and a legitimate timeout/cost stop. Final evaluator may supply its own strict validator.

### R6 — P2: authentication refresh can exceed the declared per-call timeout

Locations: `agents/vertex-auth.cjs:6`, `agents/gemini.cjs:40-41`.

The adapter awaits credential preparation before applying the remaining request timeout. Credential loading has its own fixed 45-second subprocess timeout; the full protocol's call timeout is 30 seconds. An expired credential refresh can exceed the advertised overall policy-call bound even when the HTTP request is never sent.

Required: bound authentication/preflight separately and disclose it, or enforce the remaining overall deadline through authentication as well. Test a delayed auth loader. No live API call was made in this review.

## Positive checks and actual execution

- `PlayerEnvironment` keeps Run in private fields, copies allowlisted observations/actions, rejects extra action fields and stale revisions, and never supplies the trusted spectator snapshot to the policy.
- `agents/protocol.md` correctly discloses complete current-floor geometry, partially hidden future state and the scripted policy's public visit memory; such memory must remain disclosed in comparisons.
- Save/restore validates deck, evolution provenance, character, dungeon, gem/reward and progression state. The spectator `persist()` guard avoids replacing a human save. These are inspected paths and tested cases, not a claim that every browser storage failure was manually tested.
- Final-floor victory is assigned by authoritative `Run.settleBattle()` after the battle victory state. It bypasses pending final XP-choice blockers. The player API derives success from engine terminal state, not model claims.
- Executed on Node v24.22.1: `node --test tests/player-api.test.cjs` — **14 passed, 0 failed**.
- Executed on Node v24.22.1: `node --test tests/*.test.cjs` — **419 passed, 0 failed**, about 6.1 seconds test-runner duration.
- Tests cover detached public data, malformed/stale actions, actual merchant/removal-loop regression, full five-floor scripted termination, limit behavior, mocked failure accounting, save round trips, rewards and boss state. Mock provider tests are not live-model evidence.
- No hardcoded local absolute paths were returned by the scoped search in agent/test CJS source.

## Release assessment

No demonstrated current gameplay blocker emerged from these tests. **Do not launch the new final live batch with the historical entry points unchanged:** R1 must be resolved; R2-R6 need final-wrapper corrections or precise documented treatment before freezing. Freeze hashes after corrections, then run matching fresh baseline/model protocols. New runner work was not yet available for this review and requires a follow-up review.

This review does not certify public asset rights, remote course CI, a clean-clone packaging test, model availability/pricing, student-authored reflection, peer feedback or recording access. Those remain independent release checks. A passing local test run is not remote CI evidence.

## Follow-up: initial final wrapper inspection

The author supplied `agents/final-evaluate.cjs` during this independent session. Its durable, fsync-backed append ledger is shared by both suite scopes and protected by an exclusive lock. It retains reservations across restart and refuses to overwrite partial traces. Scripted runs do not read model config; live config has an allowlist. **R1, R2 and R3 are resolved for this new entry point on code inspection**, subject to final runner tests and clean-package verification. Historical entry points still have their historical behavior and should not be the recommended final commands.

Two integration issues remain before the final freeze:

- **R7 — P2, missing actual-runner hashes.** At this inspection, the final freeze uses `versionHashes()` which fingerprints `evaluate.cjs` but not `final-evaluate.cjs`, `full-evaluate.cjs` or `progress-guard.cjs`. Changing the actual final/full orchestration could evade the version guard. Add these hashes to the freeze and manifest before trials.
- **R8 — P2, final traces not exposed to spectator.** The new wrapper writes `evaluation/final-v1-2026-11-02/full-gemini`, whereas `agents/watch-server.cjs:21` enumerates only top-level `full-*` directories and `:29` limits episode names. Thus the new final model trials will not automatically appear in the existing AI viewer. Safely support the new directory layout or provide a documented compatible read-only replay bundle without changing traces. Validate a final trace through the viewer.

R4 request classification, R5 terminal replay verification and R6 timeout scope remain relevant because the wrapper reuses historical episode/adapter functions. A disclosure may address the auth-specific timeout scope; the requested strict overall timeout should not be claimed until actually enforced. This follow-up is a snapshot of files as inspected, not a preapproval of subsequent edits.

## Follow-up: corrected final runner review

Inspected the revised final wrapper, adapter, full runner, replay validator, final suites, and `evidence/EXTERNAL-PROVENANCE.md` after the author's follow-up request.

- **R1–R3: closed for the final entry point.** Persistent shared ledger and exclusive process lock remain; config is not needed by scripted runs and live fields are allowlisted before output.
- **R4: full-run HTTP accounting fixed.** An exception marked `attempted:false` no longer adds a full-run request/failure. Historical report prose is not used by the final wrapper. Remaining follow-up: the first-floor `episode()` path still treats non-cost authentication preflight errors as failed calls; align or explicitly separate attempted HTTP requests from preflight decisions in final metrics.
- **R5: partially resolved.** Replay now requires the finish record, compares core reconstructed fields and verifies actual engine-terminal reason/success. It still permits a forged successful finish when the reconstructed engine is ongoing. Require unsuccessful terminal reporting with an allowed external-stop reason/evidence for that branch before certifying final traces.
- **R6: closed for policy-call deadline.** Credential await now races the remaining deadline before HTTP fetch. Independently exercised a never-resolving fake auth loader with a 20 ms deadline: returned `call_timeout`, `attempted:false`, sent no request and refunded the reservation. The standalone `prepare()` phase remains separately bounded by its credential subprocess; it is not gameplay decision time.
- **R7: closed.** Final/full/progress-guard source hashes are included alongside existing engine/interface/prompt/adapter/strategy hashes in both freeze and manifest.
- **R8: resolved for full five-floor traces on layout inspection.** Top-level `full-final-v1-full-gemini` and `full-final-*-[12]` episode names fit the viewer's allowlists. An actual generated trace still needs replay/spectator validation. First-floor memory suffixes do not match the current viewer endpoint; these may remain command-line replay evidence if clearly labeled, or the endpoint can be safely extended.
- Portable external provenance testing now honestly validates retained metadata and semantics rather than claiming to byte-verify omitted proprietary files. The source-byte archival procedure is explicitly separated in `EXTERNAL-PROVENANCE.md`; this is appropriate for a clean distributable package.

Independent focused execution: `node --test tests/player-api.test.cjs tests/final-budget.test.cjs tests/full-agent.test.cjs tests/vertex-auth.test.cjs tests/watch-animation.test.cjs` — **25 passed, 0 failed**. This includes no paid model requests. The separate slow-auth check described above also passed.

Small pre-freeze documentation correction requested: replace the inherited v3/v2 wording in `final-full-suite.json` scope with the actual final-v1 declaration. No gameplay changes are requested by this review.
