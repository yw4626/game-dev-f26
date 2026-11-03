# Rendering optimization — wall coverage, 2026-11-02

Skill invoked by the user: game-render-performance. This is an actual application in the ongoing development conversation, not evidence of a second independent session.

The renderer previously shaded the entire floor/ceiling/sky before overwriting covered pixels with walls. It now draws wall pixels into the reusable frame buffer, marks their exact coverage, and shades only uncovered background pixels. Billboard entities still render afterward using the existing depth rules. Coverage is cleared each frame and reallocated with the pixel buffer on size changes. The extra coverage storage is one byte per output pixel (144,000 bytes at 480×300), weakly owned by each canvas. No quality/resolution, simulation or gameplay RNG changes.

Baseline: evidence/dungeon-view-before-occlusion.cjs, the renderer immediately before this optimization (already includes the earlier projection/buffer improvements).

Offline Node v24.22.1 VM benchmark, seed VIEW-PERF, 480×300, 45 frames per version with 15 warmup frames and 30 measured frames. Frame hashes are computed outside the measured draw interval. Canvas is a test double, not browser/GPU presentation. Initialization is not included in steady-state timings. Absolute times include VM/harness overhead and must not be described as browser frame times.

| Order | Before median / p95 ms | After median / p95 ms |
|---|---|---|
| Baseline then optimized | 136.066 / 143.385 | 82.663 / 92.144 |
| Optimized then baseline | 139.948 / 148.682 | 85.334 / 94.468 |

Approximately 39% lower median time for this workload, with identical hashes in both runs. Improvements depend on wall coverage; open scenes may benefit less. No measured claim about cold-start or browser FPS.

Validation: evidence/validate-occlusion.cjs compares 60 frames across all five floors, four headings and 480×300 → 320×200 → 480×300 size changes. All frame hashes match the prior renderer; input state remains unchanged. Full suite: 419 tests passed in evidence/occlusion-tests.txt. Browser preview checked garden left/right turns and strafe input; screenshot evidence/occlusion-browser.png. No live model calls were made.

Reproduce from the project directory with Node 24:
- node evidence/benchmark-occlusion.cjs
- node evidence/benchmark-occlusion.cjs --reverse
- node evidence/validate-occlusion.cjs
- npm test
