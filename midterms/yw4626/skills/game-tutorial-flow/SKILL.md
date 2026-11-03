---
name: game-tutorial-flow
description: Design and implement interactive onboarding for games of any genre or engine, using real gameplay, contextual feedback, recoverable progression, and a clear handoff to normal play.
---

# Interactive Game Onboarding

Start with the player's learning goals, not a fixed lesson sequence. Identify the core verbs, feedback signals, decisions, and failure recovery needed to begin enjoying this particular game.

## Design a learning sequence
For each lesson, define its prerequisite, learning objective, valid completion condition, feedback target, recovery path, and next state. Teach one new relationship at a time, then combine learned actions in a meaningful challenge.

Make the environment explain why an action matters. An obstacle can motivate movement; a threat can motivate defense; a constrained resource can motivate planning. Choose examples suited to the genre rather than assuming combat, cards, shops, or levels exist.

Prefer contextual highlighting, animation, sound, and concise prompts over long instructions. Include accessible alternatives where the project supports them. Place guidance relative to the actual play area and keep essential controls visible across resolutions and languages.

## Integrate with real gameplay
Use normal gameplay commands and rules. Keep lesson progression separate from the simulation; do not implement a second version of combat, physics, economy, or interaction solely for onboarding.

Preparation may use authored scenarios, predictable randomness, or supplied resources, but should not teach behavior that fails in normal play. Explain temporary advantages when they materially change expectations.

Advance only after the intended action succeeds. Selecting an option, previewing it, and committing it may be separate states. Handle cancellation, invalid input, failure, retry, and interruption explicitly. Restrict input only when necessary for the lesson; retain user-requested exits and optional choices.

If the game persists progress, save lesson state alongside the relevant world state. Migration must not duplicate rewards or discard completed actions. Recheck derived state rebuilt during loading.

## Finish and validate
Provide a deliberate transition to normal play. Make any reset or carryover of practice progress clear. Keep ordinary play and automated evaluation outside onboarding unless explicitly requested.

Test affected character or control variants, interruption at important decisions, retry, skip, and completion. Use actual UI observation to verify highlights and pacing; headless tests cannot establish visual clarity. A disposable test scenario should not overwrite real progress.

Deliver the lesson sequence, implementation, verified recovery cases, and observed presentation results. Treat learning effectiveness as a playtest question, not something proven by passing code tests.
