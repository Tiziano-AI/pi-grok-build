# Architecture

`pi-grok-build` is a Pi package made of one extension and one skill.

```text
Pi package manifest
  ├─ extension: extensions/grok-build/index.ts
  │    └─ model-facing tool: grok_build { action: "doctor" | "preflight" }
  └─ skill root: skills/
       └─ skill: pi-grok-build
```

The current tool performs read-only package/environment discovery and foundational preflight evidence. Operational delegation will be added only after the launch, consent, state, artifact, and proof contracts are implemented together.

## Public surface

The canonical Pi model-facing surface is one tool:

```text
grok_build
```

Implemented read-only actions:

```text
doctor | preflight
```

Planned governed lifecycle actions:

```text
start | status | result | cancel | cleanup
```

Additional actions such as follow-up turns or change readback will be designed from observed Grok Build behavior and added through later ADRs.

## Source layers

| Layer | Owner | Current status |
| --- | --- | --- |
| Package manifest | `package.json` | Declares Pi extension and skill resources. |
| Extension source | `extensions/grok-build/index.ts` | Registers read-only `grok_build doctor` and `grok_build preflight`. |
| Skill source | `skills/pi-grok-build/SKILL.md` | Teaches Pi agents the bootstrap boundary. |
| Public docs | root docs and `docs/` | Define product, capability, proof, release, and authority contracts. |
| Local operator notes | ignored `AGENTS.md`, `PLAN.md`, `HANDOFF.md` | Local checkout/session guidance only. |
| Runtime state | ignored `.pi/`, future artifact roots | Local runtime evidence, not portable source. |

## Intended mature flow

The operational architecture is a supervised Pi extension lifecycle:

```text
grok_build start
  ├─ admit cwd and profile
  ├─ verify operator configuration and consent
  ├─ verify executable identity/launch policy
  ├─ create pi-grok-build-owned job and artifact root
  ├─ launch Grok Build through the selected profile
  └─ stream bounded status while retaining full artifacts

grok_build status/result/cancel/cleanup
  ├─ require pi-grok-build-owned job id
  ├─ enforce terminal-state and ownership rules
  ├─ return bounded model-facing previews
  └─ preserve artifact paths/checksums for full evidence
```

## Launch and ownership principles

- Pi owns the package surface and parent-agent supervision.
- Grok Build owns its native coding-agent execution.
- Operator configuration owns raw launch policy and provider/auth posture.
- `pi-grok-build` owns job ids, retained artifacts, output bounds, cancellation receipts, and cleanup receipts for jobs it creates.
- Parent Pi remains final authority for acceptance, validation, commits, publication, and user-facing claims.

## External authority boundary

Official xAI docs checked on 2026-05-26 describe Grok Build as usable through interactive, headless, and agent-protocol modes. They also document `grok inspect` as a discovery command. Those are Grok Build capabilities. `pi-grok-build` adopts a capability only when this repo adds the corresponding source contract, implementation, and proof lane.
