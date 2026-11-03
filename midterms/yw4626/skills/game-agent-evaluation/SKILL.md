---
name: game-agent-evaluation
description: Create shared game-control interfaces, scripted and model-driven players, reproducible evaluations, and replay evidence across game genres. Use when automated playtesting or agent comparison is requested.
---

# Automated Game Playtesting and Evaluation

Read the actual project or assignment requirements first. Define what the experiment should answer: completion, robustness, balance, coverage, accessibility, strategy quality, or another observable objective. Do not assume victory is the only useful outcome.

## Shared gameplay interface
Route human and automated inputs through the same authoritative gameplay commands. Expose only the observation allowed by the experiment: public state, legal actions or constraints, and permitted predictions. Do not leak hidden future events, private snapshots, or credentials.

Define action identity, success/failure, outcome events, and progress state. Cover all actions necessary for the requested objective, including menus, transitions, rewards, and recovery where relevant. A player that controls only the central mechanic may not complete an entire session.

Adapt control frequency and observation granularity to the game. In real-time environments, specify the simulation step, action duration, latency treatment, and pause policy. Seeds alone may not make physics or network behavior deterministic; document those limits.

Start with a scripted baseline that can exercise the complete interface, then connect a model player if requested. Log invalid responses, retries, timeouts, fallback decisions, and non-progress loops. Never silently substitute a stronger policy and attribute its actions to the model.

## Experimental protocol
Separate development scenarios from held-out evaluation. Freeze objectives, seeds or scenario definitions, budgets, stopping conditions, versions, and relevant player settings before comparison. Match starting conditions between competitors.

Preserve code/configuration hashes, observations, actions, failures, latency, and model usage. Keep credentials outside logs and game assets. Actual API spending follows the user's current authorization; previous projects do not establish a new budget.

Distinguish game defects, policy decisions, API latency, simulation stalls, and presentation delays. Capture the last progressing state and available actions when a run stalls.

Select metrics that answer the stated objective. Report distributions and individual failures where useful. Explain concrete decision sequences rather than inventing broad conclusions from a small sample. A single successful run is not evidence of robust balance.

## Reproduction and reporting
Replay recorded inputs or events and compare outcomes within the environment's determinism limits. If visible spectating is requested, use the game's normal presentation flow rather than replacing the screen with isolated state snapshots.

Version results honestly. After a gameplay fix, retain historical results and rerun affected comparisons when necessary. Clearly distinguish scripted tests, mocked calls, recorded replays, and live model experiments.

Deliver runnable interfaces and players, configuration templates, experiment commands, results, and limitations. Do not publish or submit artifacts unless requested.
