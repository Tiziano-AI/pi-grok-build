# ADR 0002: Pi-native tool contract

## Status

Accepted for bootstrap.

## Decision

`pi-grok-build` exposes one Pi model-facing tool:

```text
grok_build
```

The implemented bootstrap actions are:

```text
doctor | preflight
```

Future operational work extends this tool through explicit lifecycle actions.

Potential lifecycle actions are:

```text
start | status | result | cancel | cleanup
```

`changes`, follow-up/steering, and worktree-edit flows require later ADRs after Grok Build behavior is revalidated and a Pi-native user experience is designed.

## Rationale

Pi packages support native extension tools and skills. A single tool keeps the model-facing surface small, lets the package own job authority consistently, and keeps raw executable/provider/worktree power behind operator-owned policy.

Official xAI docs checked on 2026-05-26 describe multiple Grok Build interfaces: interactive terminal use, headless execution, `grok inspect`, and an agent-protocol mode. This ADR reserves the Pi tool shape while launch-path selection stays behind future evidence and consent.

## Scope

- Pi-facing tool contract: `grok_build`.
- Bootstrap first-success action: `doctor`.
- Bootstrap foundational readiness action: `preflight`.
- Operational actions: added only with state, consent, artifact, and proof contracts.
- Operator-owned policy: executable identity, launch profile, provider/auth posture, cwd/worktree posture, output limits, and retention.

## 0.0.4 update

`0.0.4` adds `preflight` as a second read-only bootstrap action. It returns package-local readiness evidence and deferred gates without launching Grok Build. Operational lifecycle actions remain deferred.

## Consequences

- `doctor` remains safe and read-only.
- `preflight` remains safe, read-only, and pre-operational.
- Any future action must fit the authority matrix and source/live evidence ladder.
- Operator config owns launch policy and raw Grok Build knobs.
- Parent Pi remains final authority for acceptance, validation, commits, publication, and claims.
