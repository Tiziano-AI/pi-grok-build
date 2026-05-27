# Control plane

`pi-grok-build` has one model control plane and one human operator surface.

## Identity

- Package: `pi-grok-build`
- Tool: `grok_build`
- Skill: `pi-grok-build`
- Runtime: `grok agent stdio`
- Command: `/grok-build`
- Widget: `grok-build:fixed`

## Model-facing actions

```text
start | send | status | result | changes | cancel | cleanup
```

`doctor` and `preflight` are slash/operator diagnostics only.

## Surface split

| Surface | Audience | Purpose |
| --- | --- | --- |
| `grok_build` | parent model | typed lifecycle calls with bounded output |
| `/grok-build` | human/operator | diagnostics, confirmations, shortcuts, widget control |
| fixed widget | human/operator | compact active/failure/diagnostic state |
| artifact ledger | package/runtime | retained answers, inputs, media, events, and changes |
| docs/tests | maintainers and users | public contract and validation gates |

## Ownership

The package owns session handles, assigned worktrees, ACP process supervision, artifact paths, and cleanup. The parent Pi session or human owns provider-use authorization, output acceptance, validation, commits, credentials, and publication.
