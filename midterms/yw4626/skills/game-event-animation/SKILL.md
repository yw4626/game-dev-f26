---
name: game-event-animation
description: Build synchronized gameplay feedback and smooth spectator or replay presentation across game genres and engines. Use for action timing, damage feedback, transitions, entity motion, pickups, or animation-related stutter.
---

# Gameplay Events and Presentation

Identify how the project currently separates simulation from presentation. Preserve its architecture where practical. Authoritative outcomes must not depend on whether a cosmetic animation finishes or a frame is rendered.

## Define the event contract
Trace an action's meaningful moments: anticipation, execution, contact or resolution, state change, follow-up, and recovery. Adapt this sequence to the mechanic; do not require attacks or turn-based play.

Use stable entity identifiers and enough event data to reproduce feedback: source, target, outcome, before/after values when needed, and spatial anchors. Keep cosmetic randomness independent from gameplay randomness.

For real-time or networked games, respect the simulation clock, ownership, prediction, and correction model. Do not add a second authority in the animation layer.

## Compose feedback
Synchronize numerical changes, audio, particles, and motion with the event the player perceives as the outcome. Distinguish success, failure, blocked actions, partial outcomes, and critical states using the project's visual language.

Keep temporary presentation state when an entity must finish an exit or death animation. Reconcile it with the authoritative state without allowing an obsolete entity to act again. Assign clear ownership of transforms so idle motion, locomotion, reactions, and camera effects do not fight each other.

Support the intended input rhythm through bounded buffering, cancellation, or explicit sequencing. Lock only conflicting operations. Invalidate stale callbacks when restarting, loading, changing scenes, or abandoning an interaction.

Provide reduced-motion and audio controls consistent with the project. Retain essential feedback when decorative effects are disabled. Bound effect counts and reuse resources to prevent spikes.

## Spectating and replay
When required, feed recorded actions or events into the same presentation path used by live play. Use snapshots for seeking and recovery, not as a substitute for every animation. After a seek, discard obsolete presentation tasks before resuming.

## Verify
Compare authoritative outcomes with presentation enabled and disabled where practical. Exercise rapid input, simultaneous events, removal of targets, interruption, scene changes, pause, and replay seeking as relevant.

Observe timing in the running game and measure frame behavior before claiming a performance improvement. Event-order tests establish sequencing, not perceived smoothness. Deliver the implemented feedback, actual observations, and remaining limitations.
