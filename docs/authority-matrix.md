# Authority Matrix

This matrix defines how `pi-grok-build` admits authority. Current code implements read-only `doctor` and `preflight`; future rows become tests before operational release.

| Request/state | Disposition | Required behavior | Rationale |
| --- | --- | --- | --- |
| `grok_build` with missing action | Allowed | Treat as `doctor` | Safe bootstrap default. |
| `grok_build` with `action: "doctor"` | Allowed | Read-only PATH candidate check | Package/environment discovery only. |
| `grok_build` with `action: "preflight"` | Allowed | Read-only readiness/preflight evidence | Pre-operational proof without Grok Build process launch. |
| Operational action in `0.0.x` | Guarded | Return unsupported action | Operational lifecycle belongs to future releases. |
| Raw Grok Build launch flags | Operator-owned | Accept only through future profile config | Keeps model-facing inputs stable and reviewable. |
| Executable path | Operator-owned | Accept only through future trusted config or identity policy | Launching local binaries is an authority transfer. |
| Environment variables or credentials | Secret-owned | Keep out of tool arguments and model-facing output | Secrets are never package prompt data. |
| Auto-discovered `grok` candidate | Candidate only | Require operator acceptance or identity verification before launch | `grok` is an executable candidate, not a trust root. |
| Prompt-carrying launch | Consent-gated | Require per-run consent or explicit preauthorization config | Provider/subscription use is externally visible and billable. |
| Worktree mutation | Profile-gated | Require write-capable profile and dirty-state policy | Read-only and write-capable work need separate contracts. |
| Artifact path | Package-owned | Keep under package artifact root | Cleanup and result paths need clear ownership. |
| Process cancellation | Job-owned | Address only package-created jobs | Avoid controlling unrelated local processes. |
| Status/result lookup | Job-owned | Require known package job id | Job handles are authority boundaries. |
| Concurrent launch | Policy-owned | Use explicit concurrency and locking policy | Avoid process/artifact collisions. |
| Large output | Artifact-backed | Return bounded previews with full artifact paths | Protect context while preserving evidence. |
| Package publish/dist-tags | Human-owned | Require exact publication authorization | Registry writes are external release actions. |

## Future test obligations

Before adding `start`, tests must assert at minimum:

- unsupported actions are rejected;
- additional properties are rejected;
- raw launch fields stay outside the public schema;
- missing consent/preauthorization blocks launch;
- path traversal cannot select artifact or cleanup paths;
- unowned job ids cannot be cancelled or cleaned;
- output is bounded or saved to an artifact path.
