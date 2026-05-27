# ADR 0002: Pi tool contract

## Status

Accepted.

## Decision

`pi-grok-build` exposes one model-facing Pi tool:

```text
grok_build
```

The action set is:

```text
start | send | status | result | changes | cancel | cleanup
```

`doctor` and `preflight` are `/grok-build` human diagnostics only. They are intentionally absent from the `grok_build` schema.

## Rationale

A single lifecycle tool keeps model authority small. The parent model can start work, wait, inspect, send a follow-up, read candidate diffs, stop a run, and remove retained evidence without gaining raw launch or credential authority.

Diagnostics are useful to humans, but they do not belong in the model control plane.

## Consequences

- `start` and `send` require explicit provider-use confirmation.
- `changes` works only for assigned-worktree edit profiles.
- Slash commands and the widget wrap the same service and ledger.
- Any future model-facing action requires docs, tests, authority review, and proof.
