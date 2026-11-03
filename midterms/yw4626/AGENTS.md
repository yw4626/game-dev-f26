# Duskvault implementation instructions

The game engine (`dist/engine.js`, `dist/run.js`) is authoritative. Player adapters must not duplicate damage, costs, rewards or transitions. Human visual code remains separate from headless evaluation.

Never include credentials in code, browser assets, observations, traces or reports. Model players receive only the public player API; no filesystem/shell/evaluator tools. Keep observation fields explicitly allowlisted, including legal action metadata. Do not pass private snapshots to policies.

The formal suite is `agents/suite.json`. Preserve its seeds, splits, episode objectives and limits after declaration. Tune only on development seeds. If an engine or interface bug requires a change after evaluation, label old results superseded and rerun both competitors; never silently replace a loss. Save version hashes and all failed calls. Mock/replay results are not live API evidence.

Run `npm run test:agents` for player changes and `npm test` before handoff. Use `agents/skills/evaluate-players/SKILL.md` for evaluation. Record real limitations; course CI, recordings, peer reviews, user-authored decisions and second-session skill use must not be fabricated. Do not publish or submit course artifacts without a request to do so.
