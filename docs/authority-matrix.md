# Authority matrix

| Surface | Allowed when | Side effects | Guardrail |
| --- | --- | --- | --- |
| `/grok-build doctor` | Any time | Local non-prompt discovery | No prompt, no mutation. |
| `/grok-build preflight` | Any time | Local readiness checks | No prompt, no mutation. |
| `grok_build start` | Explicit provider-use authorization | Starts Grok ACP worker; may create artifacts or assigned worktree | Requires `confirm_provider_use:true`, admitted git cwd, profile policy, and media admission. |
| `grok_build send` | Explicit provider-use authorization | Queues a prompt-carrying follow-up | Requires `confirm_provider_use:true`; terminal sessions denied; failed media admission drops the turn. |
| `grok_build status` | Known session | Reads ledger | No provider prompt. |
| `grok_build result` | Known session | Reads answer/error/artifact ledger | No provider prompt. |
| `grok_build changes` | Inactive write-capable session | Reads assigned worktree and writes change artifacts | Denied for read-only profiles and active turns. |
| `grok_build cancel` | Known session and explicit stop intent | Sends cancel or marks session cancelled | Does not delete evidence. |
| `grok_build cleanup` | Known inactive session | Deletes package-owned evidence and worktree | Denied while active; does not touch parent repo files. |
| `npm publish` | Exact human authorization | Public package publication | Never publish without package, version, and tag approval. |

Credentials and raw auth material stay outside tool inputs, docs, logs, and artifacts. The package relies on Grok's local authenticated runtime; it does not read credential files.
