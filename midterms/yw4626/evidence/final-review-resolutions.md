# Final review dispositions

R1: final runner shares an fsync append-only cost ledger across both suites and refuses concurrent processes. Budget regression test covers reopening and rejecting a request before fetch.
R2/R3: scripted final entry does not read local config; live config rejects unknown fields, never stores credentials.
R4: full and first-floor runners no longer count attempted:false as sent/failed requests; policy stop reason remains recorded.
R5: replay requires finish, checks core engine fields and terminal outcome, rejects success when engine is not terminal and requires known external-stop reason/error evidence.
R6: credential wait races the remaining call deadline; a timed-out wait cannot proceed to fetch. A dedicated mock test confirms zero network sends and reservation refund.
R7: freeze includes final/full runners and progress guard in addition to engine/interface/policy/prompt/adapter.
R8: final full traces use top-level full-* directories and compatible episode IDs. Twelve scripted traces were replayed exactly. Memory traces remain CLI replay evidence.

Portable packaging: raw original config source-byte checks are excluded from CI because the source dumps are not redistributed; provenance schema and semantic tests remain. See EXTERNAL-PROVENANCE.md. This is a correction of test dependencies, not gameplay.

Historical reports/runners remain distinct. Final protocol requires the new final entry point. No reported source-gameplay bug required changing the frozen game.
