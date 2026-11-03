# Independent skill invocation: rendering validation

Date: 2026-11-02. Agent session: `/root/independent_skill_use`.

This is a separately spawned agent session, distinct from the original implementation session and from `/root/final_readonly_review`. It is not a new user-owned chat, and no shareable session URL is available in this artifact. The course's acceptance of a separate subagent session as the required second session remains to be confirmed; this report does not claim that a public conversation link exists.

## Input and named invocation

Task received: invoke **game-render-performance**, read its instructions and the game AGENTS.md, independently validate the existing optimization, preserve historical outputs, and make no gameplay or source changes.

Read `C:/Users/23249/.codex/skills/game-render-performance/SKILL.md` and `AGENTS.md`. Applied its baseline, alternate-order measurement, pixel/state equivalence, regression, and limitation requirements. Only new evidence files were written. This was validation of an already implemented optimization, not a new optimization or an independent code review.

## Reproduction

Working directory: the game root. Runtime: Node.js v24.22.1, Windows x64, Intel Core Ultra 9 275HX. Commands below use portable `node`; this workstation executed the corresponding binary at `../tools/node-rea/node-v24.22.1-win-x64/node.exe`.

```powershell
node evidence/validate-occlusion.cjs
node evidence/benchmark-occlusion.cjs
node evidence/benchmark-occlusion.cjs --reverse
node --test tests/*.test.cjs
```

Baseline: `evidence/dungeon-view-before-occlusion.cjs`, SHA256 `6ADB0FB7F942EBBDAAD458C9CCE64C258B0077DEE779CE4F8F10774815F36CBA`.

Current: `dist/dungeon-view.js`, SHA256 `B12DF90D6A252EA13DB3B0009CA00A8C3391858B2C644F6BD55D17CB1D128784`.

## Results

The benchmark isolates CPU canvas pixel generation in a Node VM with a mock canvas. Seed `VIEW-PERF`; 480 × 300 render buffer; 45 camera frames per renderer, 15 warm-up and 30 measured frames. Frame hashing occurs outside the timed section. Both versions allocate one image buffer per benchmark instance.

| Order | Baseline median / p95 (ms) | Current median / p95 (ms) | Frames identical |
|---|---:|---:|---|
| Baseline first | 175.765 / 228.133 | 87.483 / 97.510 | Yes |
| Current first | 161.818 / 227.652 | 86.679 / 96.928 | Yes |

The separate equivalence workload uses seed `OCCLUSION-ALL`, all five floor themes, directions 0, 0.5, 1.75, and 3.9, and resize/restore 480 × 300 → 320 × 200 → 480 × 300. All 60 frame hashes match, and rendering leaves the serialized supplied state unchanged.

Full deterministic test run: **419 passed, 0 failed**, exit code 0. The test suite took 6097.9145 ms.

Artifacts:

- `independent-skill-equivalence.json`
- `independent-skill-benchmark.json`
- `independent-skill-benchmark-reverse.json`
- `independent-skill-tests.txt`

## Interpretation and limitations

The repeated isolated workload supports that skipping background pixels already covered by walls removes redundant CPU work without changing these sampled images. This independently reproduces the direction of the previous result. It does not establish browser frame rate, real input latency, GPU behavior, cold asset-loading cost, or that every source of stutter is fixed. Other work was running on this machine, and the two orders are not a controlled device-wide performance experiment. No new browser interaction verification was performed in this session. No balance, policy, engine, rendering source, or historical evidence was changed.
