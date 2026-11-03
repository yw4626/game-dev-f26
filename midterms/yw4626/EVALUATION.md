# Final evaluation v1 — 2026-11-02

This report covers only the frozen final version. Old EVALUATION.md and FULL_EVALUATION.md are historical development evidence, not pooled results. Protocol: [FINAL-PROTOCOL.md](FINAL-PROTOCOL.md).

## full-scripted

Completed 6/6; successful 6/6. Missing episodes are not successes.

|Case|Trial|History|Outcome|Floor|Steps|Illegal|Requests / failures|Mean / p95 ms|Input / output / thinking|USD|
|---|---:|---|---|---:|---:|---:|---|---|---|---:|
|full-final-antonio|1|bounded|game_won|5|636|0|0/0|0.7/0.9|0/0/0|0.000000|
|full-final-antonio|2|bounded|game_won|5|636|0|0/0|0.7/0.9|0/0/0|0.000000|
|full-final-imelda|1|bounded|game_won|5|620|0|0/0|0.6/0.8|0/0/0|0.000000|
|full-final-imelda|2|bounded|game_won|5|620|0|0/0|0.7/0.9|0/0/0|0.000000|
|full-final-arca|1|bounded|game_won|5|711|0|0/0|0.6/0.8|0/0/0|0.000000|
|full-final-arca|2|bounded|game_won|5|711|0|0/0|0.6/0.7|0/0/0|0.000000|
## full-gemini

Completed 0/6; successful 0/0. Missing episodes are not successes.

|Case|Trial|History|Outcome|Floor|Steps|Illegal|Requests / failures|Mean / p95 ms|Input / output / thinking|USD|
|---|---:|---|---|---:|---:|---:|---|---|---|---:|
## memory-scripted

Completed 6/6; successful 6/6. Missing episodes are not successes.

|Case|Trial|History|Outcome|Floor|Steps|Illegal|Requests / failures|Mean / p95 ms|Input / output / thinking|USD|
|---|---:|---|---|---:|---:|---:|---|---|---|---:|
|full-final-antonio|1|stateful-public-history|goal_reached|2|103|0|0/0|0.0/0.0|0/0/0|0.000000|
|full-final-antonio|2|stateful-public-history|goal_reached|2|103|0|0/0|0.0/0.0|0/0/0|0.000000|
|full-final-imelda|1|stateful-public-history|goal_reached|2|133|0|0/0|0.0/0.0|0/0/0|0.000000|
|full-final-imelda|2|stateful-public-history|goal_reached|2|133|0|0/0|0.0/0.0|0/0/0|0.000000|
|full-final-arca|1|stateful-public-history|goal_reached|2|150|0|0/0|0.0/0.0|0/0/0|0.000000|
|full-final-arca|2|stateful-public-history|goal_reached|2|150|0|0/0|0.0/0.0|0/0/0|0.000000|
## memory-gemini

Completed 0/12; successful 0/0. Missing episodes are not successes.

|Case|Trial|History|Outcome|Floor|Steps|Illegal|Requests / failures|Mean / p95 ms|Input / output / thinking|USD|
|---|---:|---|---|---:|---:|---:|---|---|---|---:|

Total reserved/settled final API estimate: $0.137204 of $10. In-flight reservations may exceed summed completed-episode costs. Failed requests with missing usage retain conservative reservations. Not a cloud invoice. Prices: global standard Gemini 3.5 Flash-Lite $0.30/M input, $2.50/M output including reasoning, verified 2026-11-02: https://cloud.google.com/model-garden/pricing .

## Interpretation and limits

Repeated deterministic script trials are reproducibility checks, not independent samples. Cases share initial seeds but different actions lead to different RNG trajectories. Scripts retain public visit memory; the model comparison changes only the last-six-public-step history. No claim of memory benefit is warranted until all twelve planned trials are available; with two trials per cell any difference is descriptive only. Structured agents do not assess visual clarity, fun or human tutorial usability. Network timeouts and illegal responses remain failures and are never replaced by script choices.

Use agents/replay.cjs on each trace; its manifest must match the frozen engine. API-free replay is not a fresh model call. The AI Watch page supports the six full trials. Memory-condition traces can be validated with the CLI. Current freeze and budget are in evaluation/final-v1-2026-11-02; per-scope manifests and traces are in evaluation/full-final-v1-*.

Peer feedback, student final reflection/limitations confirmation, recording link, remote course CI and CourseWorks URL submission remain separately tracked in HUMAN-EVIDENCE-PENDING.md.
