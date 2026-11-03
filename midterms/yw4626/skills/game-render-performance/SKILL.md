---
name: game-render-performance
description: Diagnose and optimize game rendering stutter, frame-time spikes, and camera-motion performance across engines and genres. Use for measured rendering optimization while preserving visual and gameplay behavior, not for changing animation choreography or game balance.
---

# Game Rendering Performance

Optimize the demonstrated bottleneck while preserving the requested visual style and gameplay. Treat lower resolution or reduced detail as explicit quality tradeoffs, not the default solution to stutter.

## Establish a reproducible baseline

Identify where the problem occurs: camera rotation, movement, scene entry, asset loading, continuous play, or UI updates. Record the scene or seed, input path, resolution, quality settings, runtime, device, and build configuration. Preserve a runnable pre-change version or equivalent baseline.

Measure the actual target runtime where possible. Separate simulation, CPU rendering, GPU work, asset decoding, memory allocation/collection, UI layout, and presentation scheduling. High average frame rate can hide pauses; inspect frame-time distributions and spikes. Also distinguish a long input lock or badly paced animation from slow rendering.

Static code inspection produces hypotheses, not proof of the dominant bottleneck. An offline benchmark can isolate a hot loop but cannot establish browser or device frame rate. State these limitations when target-runtime profiling is unavailable.

## Remove redundant work first

Apply the opportunities supported by evidence:

- **Cache invariant calculations.** Precompute projection lookup tables, geometry, or other work that depends on stable inputs. For example, screen-column ray offsets and elevation angles may depend on viewport and field of view while camera yaw changes every frame; cache the invariant portion and apply yaw at render time.
- **Reuse buffers and resources.** Reuse pixel buffers, typed arrays, textures, or temporary storage instead of allocating them every frame. Recreate them when dimensions or formats change. Ensure all required pixels and alpha values are written or cleared so reuse cannot leave stale data.
- **Skip overwritten results.** Resolve the applicable theme, material, or rendering branch before computing an expensive fallback that will be discarded. Preserve lighting, transparency, occlusion, and fallback behavior. Do not skip work with gameplay or event side effects.
- **Avoid rebuilding static structure.** Reuse stable scene topology, UI components, and static layers. Update dynamic properties separately. Measure whether a cache key or invalidation check costs more than the computation it replaces.
- **Separate loading from interaction.** Preload or incrementally prepare expensive resources before critical transitions when possible. Moving a synchronous task into a promise does not make it nonblocking; split work into bounded chunks or use suitable engine threading facilities.

Specify each cache's dependencies, invalidation conditions, owner, and memory bound. Include changes to viewport, camera parameters, map topology, theme, assets, and quality settings when relevant. Mutable inputs require an explicit revision or reliable invalidation mechanism; identity alone may be insufficient. Shared mutable buffers must not be reused by overlapping tasks without ownership or synchronization.

Do not introduce workers, a new renderer, or major architecture changes merely because they are possible. Prefer the smallest change that removes a measured source of overhead.

## Preserve correctness and appearance

Use identical inputs to compare before and after. For deterministic rendering, compare complete frame buffers or hashes across representative frames, not just the final frame. Exercise movement, rotation, boundaries, different themes, resize, and scene changes affected by the optimization.

If GPU or platform behavior prevents exact equality, document an appropriate visual tolerance and inspect meaningful differences. Do not hide unexpected differences by widening tolerance. Verify authoritative gameplay state and random-number consumption remain unchanged when the optimization should be cosmetic.

Test cache invalidation and repeated use, not only first initialization. Check that interrupted transitions, destroyed entities, or unloaded scenes cannot leave stale buffers or callbacks active.

## Measure the result

Warm up both versions, use the same workload, and repeat or alternate runs to reduce order and thermal bias. Report sample counts, median and tail frame times, allocations or memory where relevant, and the cost of cache construction. Keep measurement overhead consistent; distinguish rendering time from hashing, logging, readback, and harness overhead.

Report cold-start and steady-state behavior separately when both matter. A lower allocation count is useful evidence but does not by itself prove smoother gameplay. Likewise, a CPU microbenchmark improvement does not prove a GPU-bound scene is faster.

Run applicable regression tests and observe the actual camera or interaction in the target game. If live verification cannot be completed, describe the optimization as verified only within the measured scope rather than declaring all stutter fixed.

## Deliver

Summarize the observed bottleneck, changes, baseline and optimized measurements, visual/gameplay equivalence checks, and remaining limitations. Include reproduction steps and artifacts needed to repeat the comparison. Keep performance claims tied to their specific environment; never reuse a percentage measured in another project as an expected result.
