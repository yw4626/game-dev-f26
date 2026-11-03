# Enemy formation readouts (v10)

> 历史记录：v12已补齐爆裂/痕印石的持续碰撞和碰边爆炸，并采用多排逐列补位。当前实现以 `IMPLEMENTATION_V12.md`、`SPECIAL_EFFECTS_V12_NATIVE.md`、`ENEMY_WAVES_V12.md` 为准。
The overlap came from rendering two engine rows at the same `--enemy-column` x coordinate, separated by only44px vertically. Each readout was taller than44px. Boss-specific offsets added a second overlapping positioning system.

`dist/app.js` now assigns one presentation lane to every enemy. Lanes sort by combat column, then combat row; the engine's slot object is not changed. Front/back and the one-based combat column remain visible above each name. Defeated enemies retain their lane so the remaining targets do not jump during resolution. `data-enemy`, `data-row`, and `data-column` remain available to combat animations.

The appended `dist/pixel-skin.css` rules use a CSS grid of equal lanes for3/4/5 enemies and boss groups. Readouts stay inside their own lanes; all actions get separate wrapping lines, HP/armor may wrap, and sprites shrink to the remaining vertical space. Boss and back-row sprite sizes still differ. Labels occupy the upper part of the scene, above the hand; the old absolute column offsets and entrance translation no longer position this grid.

Validation: `node --check dist/app.js` passed. `node --test tests/enemy-layout.test.cjs` passed5/5 cases: normal3/4/5 and boss3/4. These assert unique lane assignment, unchanged combat slots, per-enemy names/intent/HP structures, and preservation of multi-action intent text.

Responsive visual fixture: `node tests/enemy-layout.test.cjs --serve`, then open `http://127.0.0.1:8766`. It renders the actual drawEnemies function with all current styles at830px,440px,320px central-field widths and a marked hand reservation. The child agent's Chrome connector could not reach loopback and no IAB surface was available; root browser QA is therefore required before claiming screenshot verification. The fixture never loads or changes the user's saved run.
