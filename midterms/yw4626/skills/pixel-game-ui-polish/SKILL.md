---
name: pixel-game-ui-polish
description: Improve visual consistency and readability in pixel-art games across genres and engines, including HUDs, world elements, typography, scaling, localization, and responsive layouts. Use only when pixel art is the intended direction.
---

# Pixel-Art Game Presentation

Inspect the actual screen and the user's intended art direction before changing assets or resolution. Determine whether the problem is source detail, interpolation, layout, projection, contrast, or rendering performance.

## Define a visual baseline
Identify a practical logical pixel scale, asset size families, outline treatment, palette, and typography hierarchy. They should fit the game's camera and display targets. Do not prescribe one resolution or mood for every game.

Use nearest-neighbor sampling and integer scaling where appropriate. Avoid arbitrary downsampling as a universal fix: it can destroy silhouettes and readability. Match apparent pixel density while allowing deliberate size differences between entities.

Use shared components for repeated interface elements. Define separate roles for primary values, labels, secondary information, and interaction states. Color should support meaning without being the sole signal.

## Improve composition
Keep actionable information readable at the expected viewing distance. Shorten redundant copy before shrinking all text. Check long localized strings, large values, selected states, disabled states, and dense inventories where applicable.

Anchor world elements consistently in the game's coordinate system. Respect camera projection, depth, occlusion, and contact with surfaces. Screen-space overlays should follow projected anchors when appropriate, rather than hide world-position errors.

Preserve semantics when changing decoration. Removing a frame should not silently remove the information inside it. Distinguish decorative effects from essential feedback.

For new art, use suitable licensed assets or generation when needed, and retain provenance. Simple geometric icons may be better implemented in the project's native drawing system than as generated bitmaps.

## Performance and verification
Measure before reducing fidelity. Consider asset loading, texture churn, repeated layout work, overdraw, and expensive filters. Cache or reuse static work where the engine permits it.

Inspect the running game in representative states and target display sizes. Check readability, overlap, alignment, animation interaction, and localization. Review final style/material overrides rather than accumulating conflicting patches.

Deliver focused changes with screenshots from inspected states and any measured performance results. Do not claim visual consistency or smoothness based only on automated logic tests.
