# Duskvault — yw4626 midterm

A complete five-floor, first-person pixel dungeon card game with four playable characters, onboarding, exploration, card combos, rewards, gems, evolution, shops, and distinct bosses. Educational reconstruction informed by Vampire Crawlers artifacts, with original balancing and presentation. It does not include the original executable or extracted game art.

## Run from a clean clone

Install Node.js 24. From the course repository run:

```sh
cd midterms/yw4626
npm start
```

Open http://127.0.0.1:8765/ . No dependency install, original game, Python, API key or network access is needed to play. English is the default; select Chinese on the start screen. WASD move, Q/E turn; walk into objects to interact. Click a card or drag it into the battlefield to play; targeting is automatic. Defeat the fifth-floor vampire to win; zero health loses. Tutorial is available before a first run. The AI Watch button opens recorded autonomous gameplay, not a new paid call.

```sh
npm test
npm run test:agents
node agents/evaluate.cjs --dev --seed CI-DEV-20261102
node agents/final-evaluate.cjs
```

Final scripts use frozen cases and preserve results. Re-running completed trials does not replace failures. For models, install gcloud separately, enable Vertex on your own project and authenticate application-default credentials. Copy agents/vertex.example.json to ignored agents/gemini.final.local.json and set project. Then run:

```sh
node agents/final-evaluate.cjs --live --config agents/gemini.final.local.json
```

This is paid: cumulative final budget is $10 including missing-usage reservations. Never delete the ledger to restart spending. See [protocol](FINAL-PROTOCOL.md), [public interface](agents/protocol.md), [evaluation](EVALUATION.md). Do not use historical uncapped entry points for the final experiment.

## Scope and evidence

- [Rule map and deliberate adaptations](RULE-SOURCES.md)
- [Asset sources and licenses](THIRD_PARTY_ASSETS.md); distributed notices under dist/assets/licenses and effect folders
- [Independent review](evidence/final-independent-review.md)
- [Separate skill session](evidence/independent-skill-session.md); reusable English skills in skills/
- [Team decisions, student confirmation pending](AGENT-TEAM.md)
- [External/human evidence pending and recording outline](HUMAN-EVIDENCE-PENDING.md)

The five-floor order and bosses, tutorial, in-run economy, balancing and generated gothic art are project design adaptations. Scope is a bounded playable interpretation, not full original fidelity. Current-floor geometry is public; future floors, draw order and future offers are hidden. Script policy has public visit memory. Small evaluation samples cannot establish broad balance or fun.

Video link: PENDING. Peer feedback: PENDING. Week 3/checkpoint links: PENDING. Course PR / green remote CI: PENDING. These are not claimed complete. Historical reports are development evidence only and are separate from final results.

Archived raw source dumps, installers, dependencies, credentials and original proprietary binaries are intentionally excluded. Some source reports reference local archival evidence not distributed; those references are not clean-clone runtime dependencies. Generated source-art archives remain local; runtime derivatives and source-hash manifests are included. Rights questions about reverse-engineered configuration require instructor confirmation; no license to the original game is asserted.
