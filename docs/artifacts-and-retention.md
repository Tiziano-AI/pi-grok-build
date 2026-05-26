# Artifacts and Retention

Current `0.0.x` doctor and preflight behavior is stateless: it creates zero package artifacts.

Future operational releases need retained evidence because Grok Build output, logs, status, and changes can exceed safe model-context limits.

## Future artifact contract

A mature release should create one package-owned artifact root. Every job should have an opaque job id and a dedicated directory below that root.

Required artifacts for future prompt-carrying jobs:

| Artifact | Purpose |
| --- | --- |
| `job.json` | Non-secret job metadata, state, timestamps, cwd, profile, consent receipt. |
| `events.jsonl` | Bounded/material event stream or normalized status events. |
| `result.md` | Final answer text when available. |
| `receipt.json` | Terminal state, exit/cancel/timeout proof, output limits, redaction status. |
| `stdout.log` / `stderr.log` | Full retained process output when safe and redacted. |
| `changes.json` / `changes.diff` | Future actual filesystem/git readback for write-capable jobs. |

## Output limits

Model-facing tool results must stay bounded. Large output should be truncated and point to a retained artifact path. Truncation policy should follow Pi extension guidance: keep model context small, clearly label truncation, and preserve full evidence when safe.

## Cleanup authority

Future `cleanup` is package-scoped. It addresses package-owned artifacts for the selected job and leaves other authority domains to their owners:

- files outside the package artifact root;
- symlink escape targets;
- Grok account/auth state;
- arbitrary Grok worktrees;
- Pi package settings or installed package caches;
- npm registry artifacts;
- source files.

## Retention proof

A cleanup receipt proves package-owned artifact disposition for one job. Provider-side deletion, Grok memory deletion, auth deletion, and Pi tool exposure teardown require separate owner-specific receipts.
