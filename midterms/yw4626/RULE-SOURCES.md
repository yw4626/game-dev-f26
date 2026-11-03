# Rule and implementation source map

Tags: CODE = original shipped configuration/native evidence; OBSERVED = recorded runtime observation; DESIGN = deliberate project adaptation; ASSUMED = unverified interpretation. Imported numbers do not imply full original-game fidelity. Source locators below are evidence reports, not redistribution of the original program.

| System | Evidence and locator | Current implementation | Status |
|---|---|---|---|
| Costs, combos, damage | GEM_CARD_CONFIG_EVIDENCE.md; COMBAT_V9_IMPLEMENTATION.md | dist/engine.js | CODE + DESIGN adjustments |
| Area and rear splash | AREA_V13_NATIVE.md; SPECIAL_EFFECTS_V12_NATIVE.md | dist/engine.js; dist/combat-specials.js | CODE interpreted in discrete rows |
| Evolution recipes and gems | EVOLUTION_V10_CONFIG_EVIDENCE.md; GEM_NATIVE_EVIDENCE.md | dist/evolution-v10.js; dist/gems.js | CODE; unlocked subset and inheritance DESIGN |
| Wild and skill cards | PICKUP_NATIVE_EVIDENCE.md; EXTRA_CARD_V7_EVIDENCE.md | dist/wild-v10.js; dist/extra-cards-v7.js | CODE + balance DESIGN |
| Progression and characters | LEVEL_NATIVE_EVIDENCE.md; CHARACTERS_V14_NATIVE.md | dist/run.js; dist/characters-v14.js | CODE + five-floor DESIGN |
| Rooms and encounters | ROOM_LAYOUT_NATIVE_EVIDENCE.md; ENEMY_WAVES_V12.md | dist/world-gen.js; dist/encounters.js | CODE-informed DESIGN, not exact original generator |
| Five distinct boss mechanics, tutorial | tests/boss-v28.test.cjs; tests/tutorial.test.cjs (where present) | dist/engine.js; tutorial modules | DESIGN |
| Feedback, rendering, bilingual UI | THIRD_PARTY_ASSETS.md | dist/app.js; dist/dungeon-view.js | DESIGN |
| Agent information boundary | agents/protocol.md; tests/player-api.test.cjs | agents/environment.cjs | DESIGN |

Native reports retain names/addresses/hash references for local investigation. Omitted source dumps cannot be revalidated from the public package; see evidence/EXTERNAL-PROVENANCE.md. Any unresolved native inference remains unverified, not a confirmed original mechanic. This is an educational reimplementation, not the original game or all its content.
