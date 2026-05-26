# Capabilities

Freshness: source review and official xAI/Pi documentation checked on 2026-05-26.

## Matrix

| Capability/action | Surface | Status | Provider/live use | Files/worktree mutation | Output/evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `doctor` | `grok_build` tool | Implemented | No | No | Candidate executable discovery and bootstrap status | First-success package/environment probe. |
| `preflight` | `grok_build` tool | Implemented | No | No | Foundational readiness evidence and deferred launch gates | Pre-operational checklist; claim ceiling defined in the evidence ledger. |
| `start` | Future `grok_build` action | Deferred | Yes, when prompt-carrying | Depends on profile | Job id plus bounded launch/status receipt | Requires consent, executable identity, config, state machine, and artifacts contract. |
| `status` | Future `grok_build` action | Deferred | No new provider use by itself | No | Bounded status preview plus artifact refs | Requires owned job id and cursor/state semantics. |
| `result` | Future `grok_build` action | Deferred | No new provider use by itself | No | Bounded answer preview plus full artifact path | Separates answer text from debug/tool activity when those streams are available. |
| `cancel` | Future `grok_build` action | Deferred | May signal owned process | No | Cancellation receipt and terminal-state proof | Addresses package-owned live jobs. |
| `cleanup` | Future `grok_build` action | Deferred | No | Deletes package-owned artifacts only | Cleanup receipt | Cleans retained package evidence for one addressed job. |
| `changes` | Possible future action | Future-governed | No new provider use by itself | Reads actual filesystem/git state | Change artifacts | Requires a write/worktree ADR and readback tests. |
| follow-up/steering | Possible future action | Future-governed | Yes, if prompt-carrying | Depends on profile | Turn/job receipt | Requires proof that Grok Build supports the intended lifecycle safely. |
| launch profile | Future operator config | Deferred | Depends on profile | Depends on profile | Effective-policy readback | Curated ids keep raw launch policy operator-owned. |
| artifact retention | Future package state | Deferred | No | Package artifact root only | Paths, checksums, cleanup receipt | Required for large outputs and release evidence. |

## Official Grok Build surfaces observed

Official xAI docs checked on 2026-05-26 describe Grok Build as supporting:

- interactive terminal use;
- headless prompts with plain, JSON, and streaming JSON output;
- an agent-protocol mode for app integration;
- `grok inspect` for discovered config, instructions, skills, plugins, hooks, and related resources;
- configuration, authentication, permissions, sandbox profiles, skills, plugins, hooks, and subagents.

Those are Grok Build capabilities. `pi-grok-build` adopts a capability when this repo adds the corresponding source contract, implementation, tests, and proof lane. Current `preflight` uses package-local checks and keeps Grok Build process execution in the future launch-policy lane.

## Capability admission rule

A capability moves from deferred to implemented only when all are true:

1. source contract is documented;
2. action schema is tested;
3. authority rows are tested;
4. output is bounded or artifact-backed;
5. provider/worktree effects have consent/config policy;
6. release proof distinguishes source, package, Pi loader, and live behavior.
