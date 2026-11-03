# Agent team and my design decisions

Student: Yibo Wang (yw4626). Decision notes supplied by the student on 2026-11-02; organized and translated by the assistant below. Student final review/sign-off is still pending. No rejected suggestions or reasons have been invented.

## My decisions

I changed the original game's out-of-run gold progression into an in-run currency system. I made the decisions about each floor's boss design and the final boss's attack mechanics. I also directed the introductory tutorial level. To improve visual consistency, I decided to unify the pixel resolution across the game. I adjusted balance values, including merchant prices and monster damage.

These are the decisions I have identified so far. My reasons for accepting or rejecting specific agent suggestions, and my final limitations assessment, still need to be added in my own words.

## Agent roles and permissions (factual index)

- Implementation assistant: reconstructed rules from available artifacts, implemented game/interface/players, tested and documented changes under student direction. It cannot author student experiences or fabricate peer feedback.
- Scripted player: chooses actions through the shared public five-operation interface; keeps public visited-service memory.
- Model player: Vertex Gemini chooses legal action IDs from public observations and bounded history, without repository access or hidden state. Final experiments share a $10 ceiling.
- Independent read-only reviewer: separate session `/root/final_readonly_review`, not a game author; findings in evidence/final-independent-review.md. It wrote the review only.
- Independent skill practitioner: separate session `/root/independent_skill_use`, invoked game-render-performance and reproduced rendering checks; report in evidence/independent-skill-session.md. It did not act as the reviewer.

## Evidence and pending material

See FINAL-PROTOCOL.md, RULE-SOURCES.md, agents/skill-use.md and the two independent reports. Separate subagent identifiers are recorded honestly; a shareable chat link and confirmation that this satisfies the course's two-session evidence format remain pending. Same-thread historical invocations alone are not counted as two sessions.

Peer playtest feedback: not yet available (confirmed by student). Week 3/checkpoint links, recording link, explicit rejected suggestions/reasons, and personal final limitations confirmation: still pending. This page is not represented as a completed unassisted personal reflection.
