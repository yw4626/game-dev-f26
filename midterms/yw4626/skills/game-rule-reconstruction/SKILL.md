---
name: game-rule-reconstruction
description: Reconstruct or verify game mechanics from source code, configuration, shipped artifacts, and runtime observations. Use for evidence-based recreation or mismatches between rules and presentation, across game genres and engines.
---

# Evidence-Based Game Mechanics

Use this skill to understand or reproduce an existing mechanic. Do not treat reconstruction as the default approach to original game design. Preserve the requested platform, engine, genre, and scope.

## Establish the contract
Identify the behavior being investigated, the target version, available evidence, and the observable result. Separate four categories: directly observed behavior, static-code evidence, inferred behavior, and intentional design changes.

Trace the smallest relevant path from player input to state change and feedback. Depending on the game, inspect timing, collision, targeting, resource consumption, random selection, progression, or persistence. A configuration field is not proof that its consumer executes.

## Implement one authoritative rule
Place the mechanic in the project's authoritative simulation or gameplay layer. UI descriptions, predictions, tutorials, and automated players should consume that layer's results or shared metadata rather than duplicate its formulas.

Separate parameters from execution where it helps comparison. Preserve units, update frequency, rounding, event order, and randomness. In real-time games, distinguish frame-dependent behavior from elapsed-time behavior; in networked games, identify which peer owns the decision.

When evidence is incomplete, label the assumption and make it replaceable. Request a focused runtime capture only when it can resolve a material uncertainty. Do not describe a plausible approximation as a verified original rule.

## Verify and report
Choose cases that distinguish competing explanations, including boundaries, interacting effects, interruption, and persistence where relevant. Record inputs, expected behavior, observed behavior, version, and evidence location.

Keep unsupported research findings out of player-facing lists of available features. Preserve them in development notes when useful. If a rule changes after evaluation, retain old results with their original version and rerun affected comparisons when necessary.

Deliver the implemented behavior, supporting evidence, relevant tests, and remaining uncertainty. Static inspection, simulation tests, and live observation are different forms of evidence; state which were actually performed.
