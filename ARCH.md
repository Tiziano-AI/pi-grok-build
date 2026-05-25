# Architecture

`pi-grok-build` is a Pi package made of one extension and one skill.

Current runtime implementation is deliberately small:

```text
Pi package manifest
  ├─ extension: extensions/grok-build/index.ts
  │    └─ model-facing tool: grok_build { action: "doctor" }
  └─ skill root: skills/
       └─ skill: pi-grok-build
```

The current tool only checks local executable candidates on `PATH`. It does not launch Grok Build.

## Public surface

The canonical Pi model-facing surface is one tool:

```text
grok_build
```

Implemented action:

```text
doctor
```

Future governed lifecycle actions may include:

```text
start | status | result | cancel | cleanup
```

`changes` and `send` are not accepted bootstrap promises. They require a later ADR if Grok Build's real lifecycle and Pi user experience justify them.

## Source layers

| Layer | Owner | Current status |
| --- | --- | --- |
| Package manifest | `package.json` | Declares Pi extension and skill resources. |
| Extension source | `extensions/grok-build/index.ts` | Registers read-only `grok_build doctor`. |
| Skill source | `skills/pi-grok-build/SKILL.md` | Teaches Pi agents the bootstrap boundary. |
| Public docs | root docs and `docs/` | Define future-proof control-plane boundaries. |
| Local operator notes | ignored `AGENTS.md`, `PLAN.md`, `HANDOFF.md` | Local checkout/session guidance only. |
| Runtime state | ignored `.pi/`, future artifact roots | Not portable source. |

## Intended mature flow

The future operational architecture is a supervised Pi extension lifecycle, not a raw CLI wrapper:

```text
grok_build start
  ├─ admit cwd and profile
  ├─ verify operator configuration and consent
  ├─ verify executable identity/launch policy
  ├─ create pi-grok-build-owned job and artifact root
  ├─ launch Grok Build only after authorization
  └─ stream bounded status while retaining full artifacts

grok_build status/result/cancel/cleanup
  ├─ require pi-grok-build-owned job id
  ├─ enforce terminal-state and ownership rules
  ├─ return bounded model-facing previews
  └─ preserve artifact paths/checksums for full evidence
```

## Non-goals and rejected architectural paths

- no Codex/CDX dependency
- no MCP bridge as the Pi package surface
- no raw xAI API fallback for the Grok Build delegation product
- no TUI scraping fallback
- no model-facing raw Grok Build flag DSL
- no launch of the first executable found on `PATH` without identity and consent policy
- no cleanup or cancellation of processes/artifacts not owned by this extension

## External authority boundary

Official xAI docs checked on 2026-05-25 describe Grok Build as usable through an interactive TUI, headless `grok -p` mode, and ACP `grok agent stdio`. Those are external capabilities of Grok Build, not accepted `pi-grok-build` runtime paths until this repo adds a specific ADR, implementation, and proof lane.

## Acceptance authority

Pi remains the parent agent/harness. Grok Build output is evidence or candidate work only. Future `pi-grok-build` must not claim final acceptance, validation, merge, commit, publication, or user-visible truth without parent review and explicit proof.
