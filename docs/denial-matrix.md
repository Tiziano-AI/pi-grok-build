# Denial Matrix

This matrix is a source contract for fail-closed behavior. Current code implements only `doctor`; future rows must be converted into tests before operational release.

| Request/state | Current status | Required behavior | Rationale |
| --- | --- | --- | --- |
| `grok_build` with no action | Allowed | Treat as `doctor` | Safe bootstrap default. |
| `grok_build` with `action: "doctor"` | Allowed | Read-only PATH candidate check | No provider, shell, credential, or mutation effect. |
| Any other action in `0.0.x` | Denied | Throw/error with unsupported action | Prevent accidental operational claims. |
| Model supplies raw Grok Build flags | Denied | Reject as model-facing input | Operator config owns launch policy. |
| Model supplies executable path | Denied | Reject as model-facing input | Prevent arbitrary command execution. |
| Model supplies env vars or credentials | Denied | Reject and never echo values | Secrets are not prompt/tool arguments. |
| Auto-discovered `grok` candidate used for launch | Denied until governed | Require configured path or identity verification and consent | `grok` is generic/ambiguous. |
| Launch without explicit consent/preauthorization | Denied | Do not spawn Grok Build | Prompt-carrying provider/subscription use needs consent. |
| Launch from dirty or sensitive cwd | Deferred/denied | Require cwd policy and dirty-state contract | Avoid writing into unsafe/shared state. |
| Worktree mutation without write profile | Denied | Do not allow write-capable delegation | Keep read-only and write-capable scopes separate. |
| Cleanup path outside package artifact root | Denied | Refuse path escape/symlink escape | Cleanup must delete only owned artifacts. |
| Cancel unknown or unowned process | Denied | Refuse | Extension must not kill arbitrary processes. |
| Status/result for unknown job id | Denied | Return not-found/unauthorized | Job handles are authority boundaries. |
| Concurrent launch in same owned slot without policy | Denied until governed | Require explicit concurrency design | Avoid state/process collisions. |
| Unbounded stdout/stderr to model | Denied | Truncate and save full artifact | Protect context and privacy. |
| MCP bridge as Pi surface | Denied | Do not implement as package contract | Pi-native extension/tool/skill is canonical. |
| CDX/Codex dependency | Denied | Do not import or shell out | Product independence. |
| Source-uninspectable dependency | Denied | Do not add runtime dependency | User trust boundary. |
| Package publish by agent without exact authorization | Denied | Do not run `npm publish` | External irreversible action. |

## Future test obligations

Before adding `start`, tests must assert at minimum:

- unsupported actions fail closed;
- additional properties are rejected;
- raw flag/env/executable fields are rejected;
- missing consent/preauthorization denies launch;
- path traversal cannot select artifact or cleanup paths;
- unowned job ids cannot be cancelled or cleaned;
- output is bounded or saved to an artifact path.
