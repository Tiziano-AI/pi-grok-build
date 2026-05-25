# Capabilities

Freshness: source review and official xAI/Pi documentation checked on 2026-05-25.

## Matrix

| Capability/action | Surface | Status | Provider/live use | Files/worktree mutation | Output/evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `doctor` | `grok_build` tool | Implemented | No | No | Candidate executable discovery and bootstrap status | Does not prove Grok Build identity, login, subscription, prompt behavior, or delegation. |
| `start` | Future `grok_build` action | Deferred | Yes, if prompt-carrying | Depends on profile | Job id plus bounded launch/status receipt | Requires consent, executable identity, config, state machine, and artifacts contract. |
| `status` | Future `grok_build` action | Deferred | No new provider use by itself | No | Bounded status preview plus artifact refs | Requires owned job id and cursor/state semantics. |
| `result` | Future `grok_build` action | Deferred | No new provider use by itself | No | Bounded answer preview plus full artifact path | Must separate answer text from debug/thought/tool activity if Grok Build exposes those streams. |
| `cancel` | Future `grok_build` action | Deferred | May signal owned process | No | Cancellation receipt and terminal-state proof | May cancel only package-owned live jobs. |
| `cleanup` | Future `grok_build` action | Deferred | No | Deletes package-owned artifacts only | Cleanup receipt | Must not delete Grok account/auth state, Pi package state, or arbitrary worktrees. |
| `changes` | Possible future action | Future-governed | No new provider use by itself | Reads actual filesystem/git state | Change artifacts | Requires a write/worktree ADR and readback tests. |
| follow-up/steering | Possible future action | Future-governed | Yes, if prompt-carrying | Depends on profile | Turn/job receipt | Requires proof that Grok Build supports the intended lifecycle safely. |
| raw Grok Build flags | Model-facing input | Denied | N/A | N/A | Denial | Operator config only. |
| arbitrary executable path | Model-facing input | Denied | N/A | N/A | Denial | Use operator config or verified identity policy. |
| provider credential values | Model-facing input/output | Denied | N/A | N/A | Denial | Never echo or accept raw secrets. |
| generic xAI model provider | Pi model provider | Out of scope | Yes | No | N/A | This package is a Grok Build integration, not a generic model-provider package. |
| MCP bridge as Pi surface | Package integration path | Denied | N/A | N/A | Denial | Pi-native extension/tool/skill surfaces are canonical. |
| CDX/Codex dependency | Product path | Denied | N/A | N/A | Denial | Prior art may inform quality only; it is not a dependency. |

## Official Grok Build surfaces observed

Official xAI docs checked on 2026-05-25 describe Grok Build as supporting:

- interactive TUI via `grok`;
- headless prompts via `grok -p` with `plain`, `json`, or `streaming-json` output;
- ACP via `grok agent stdio`;
- configuration, authentication, permissions, sandbox profiles, skills, plugins, hooks, MCP servers, and subagents.

Those are Grok Build capabilities. They are not accepted `pi-grok-build` capabilities until this repo adds an ADR, implementation, tests, and proof lane.

## Capability admission rule

A capability moves from deferred to implemented only when all are true:

1. source contract is documented;
2. action schema is tested;
3. denial rows are tested;
4. output is bounded or artifact-backed;
5. provider/worktree effects have consent/config policy;
6. release proof distinguishes source, package, Pi loader, and live behavior.
