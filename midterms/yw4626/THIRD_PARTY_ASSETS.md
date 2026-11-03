# Pixel art and font sources

## Current unified inventory and lower-resolution sprites: v26

The built-in `image_gen` tool created a 64-cell inventory/character atlas and a 16-cell prop atlas for this project. Originals and the exact prompts are preserved in `art-sources/unified-v26/`. `scripts/import-unified-v26.py` imports them at 32×32 logical pixels, retaining nearest-neighbor pixel edges and a restrained shared palette. It also compiles the v25 normal creatures to 32×32 and guardians to 48×48. The new card and prop art is generated project artwork, not extracted game artwork or a claimed CC0 pack.

Runtime PNGs, source hashes, crop coordinates and roles: `dist/assets/unified-v26/manifest.json`. `dist/unified-assets-v26.js` embeds PNGs and sprite rows for offline/file playback and existing particle effects. Every currently enabled card has a matching icon. The mansion retains its architectural source; it is sampled through the lower-resolution scene canvas. UI/font/audio licenses below remain unchanged. Current wall details are independently authored in `dist/surface-detail-v26.js` and compiled to 64px textures.

## Current monster and mansion artwork: v25

All 25 floor-specific normal monsters, five guardians, legacy monster aliases and the garden mansion now use a cohesive set generated with the built-in `image_gen` tool for this project. These are generated project assets, not CC0 downloads and not extracted game artwork. Original outputs and the exact prompt set are retained in `art-sources/gothic-v25/`; runtime PNGs and source hashes are in `dist/assets/gothic-v25/manifest.json`. `scripts/import-gothic-v25.py` applies transparent crops, nearest-neighbor normalization and a shared 32-color palette. `dist/gothic-assets.js` supplies the same pixels to the scene and combat renderers.

The older v24 monster packs below remain archived for reproducibility, but their creature/mansion roles are overridden at runtime by v25. Kenney UI, props, card icons, fonts and audio remain in use with their original licenses. Environment surfaces are repository-authored pixel textures. No image service is contacted while playing.

## Five-floor themes, 2026-10-31

| Source | Author / license | Local use |
|---|---|---|
| [50+ Monsters Pack 2D](https://opengameart.org/content/50-monsters-pack-2d) | isaiah658, CC0 1.0 | 20 normal monster roles; #23 also supplies the rat guardian, with added corruption growths. Source #26 and #47 are not used. |
| [monster plant](https://opengameart.org/content/monster-plant) | ArVexi1050, CC0 1.0 | Garden plant guardian |
| [Pixel Books](https://opengameart.org/content/pixel-books) | Blue, CC0 1.0 | Library book enemy; guardian derived with authored magic pages and face. Only edge-connected white background removed; book pages preserved. |
| Existing Tiny Dungeon | Kenney, CC0 1.0 | Four prison enemy roles, unchanged pixel colors |

Original HTML source pages, archives and images: `art-sources/themes-v24/`. Imported runtime PNGs and source hashes: `dist/assets/themes/manifest.json`. Rebuild with `scripts/import-theme-art.py`. Imports use transparent bounding-box crops and nearest-neighbor display. The vampire, giant prisoner, mansion facade, five floor/ceiling/wall surface designs and compositing code are authored in this repository; they are not extracted from Vampire Crawlers. The original monster pack's credits and the remaining asset source notices are distributed in `dist/assets/licenses/`.

All assets run locally after import; no external image service is required.

Imported on 2026-10-29. All game resources are local; the game does not contact a CDN.

| Resource | Author / official source | License | Usage |
| --- | --- | --- | --- |
| Tiny Dungeon 1.0 | [Kenney](https://kenney.nl/assets/tiny-dungeon), [author's OpenGameArt upload](https://opengameart.org/content/tiny-dungeon) | CC0 1.0 | Ghost, undead, skeleton, bat, slime, sentinel and boss visual roles; chest, weapon/shield and mana pickup sprites |
| Pixel UI Pack | [Kenney, with Lynn Evers](https://kenney.nl/assets/pixel-ui-pack), [author's OpenGameArt upload](https://opengameart.org/content/pixel-ui-pack-750-assets) | CC0 1.0 | Ancient grey/tan panel, button, pressed and parchment nine-slice frames |
| Ark Pixel Font, 12px proportional, Simplified Chinese, 2026.10.25 | [TakWolf and contributors](https://github.com/TakWolf/ark-pixel-font/releases/tag/2026.10.25) | SIL Open Font License 1.1 | Local `woff2` font for Chinese, English, numbers, dialogs, cards, HUD and canvas labels |

The unmodified license texts are distributed in `dist/assets/licenses/`. Original downloads and extracted packs are in `art-sources/`. Kenney's current website download endpoint returned HTML/403 during import, so the actual sprite ZIPs came from the same author's OpenGameArt uploads above.

`scripts/import-pixel-art.py` reads the original 16×16 PNGs and serializes their exact pixels into `dist/pixel-assets.js`, allowing the first-person renderer and SVG combat art to share the same sprites. Its manifest records the source file and SHA-256 for each imported role. No recoloring or smoothing is applied. Selected originals are also retained under `dist/assets/kenney/`.

The Clover Petal pixel icon, library walls, floor, ceiling, other card art, two character portraits, map symbols, and stepped heart/mana indicators are independently drawn code-based artwork in this prototype. They are not extracted original-game art. Character/monster appearance is a visual adaptation; original game numerical configuration and native evidence are documented separately.

The font is bundled unchanged and retains its original name and license. `dist/pixel-font.css` also embeds the same WOFF2 bytes as a data URL so the font works when launching `dist/index.html` directly without a server. Developer raw configuration and exported logs retain source-language evidence even when the presentation language is English.

## PixelFX and sound, v0.22 (2026-10-31)

- **PixelFX**, Patch and Hugo Duprez: [official repository](https://github.com/patch-gg/pixelfx), MIT. Pinned commit `a84159688af3ca37a4be05a0d422b94451b2e24e`; source and rendering tools are in `vendor/pixelfx`. `scripts/build-pixelfx.mjs` exports 20 transparent sheets at 24 FPS, fixed visual seed 17, without demo actors. Long effects retain their first 1.6 seconds and are faded during gameplay. Generated sprites are in `dist/assets/pixelfx`, with the upstream LICENSE, NOTICE and revision record. Sprite Fusion adaptations retain their notices. The upstream gallery's proprietary Patch Pixel font is **not** included or used.
- **Kenney Impact Sounds**, [official asset page](https://kenney.nl/assets/impact-sounds), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/): `impactWood_light_002.ogg` and `impactWood_light_003.ogg`. The original download endpoint returned HTML; files were obtained from the pinned `gdquest-demos/godot-open-rpg` mirror, whose credits attribute this pack to Kenney under CC0. Exact revision and file URLs are in `dist/assets/audio/SOURCE.txt`. `dist/audio-samples.js` embeds those same bytes to support local-file playback without fetch/CORS.
- Other attack, shield, damage, coin and XP sounds are independently authored Web Audio synthesis patches in `dist/game-audio.js`; they are not extracted from Vampire Crawlers or attributed to Kenney.

No external service or CDN is contacted by the running game. PixelFX source is only used by the offline asset exporter; production playback uses the locally generated sheets and the project's own presentation controller.
