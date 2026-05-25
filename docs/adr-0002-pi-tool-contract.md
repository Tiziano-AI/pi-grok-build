# ADR 0002: Pi-native tool contract

## Status

Accepted for bootstrap.

## Decision

`pi-grok-build` exposes one Pi model-facing tool:

```text
grok_build
```

The only implemented bootstrap action is:

```text
doctor
```

Future operational work must extend this tool through explicit lifecycle actions rather than adding parallel model-facing tools or exposing raw Grok Build command-line flags.

Potential lifecycle actions are:

```text
start | status | result | cancel | cleanup
```

`changes`, follow-up/steering, ACP-specific controls, and worktree-edit flows require later ADRs after Grok Build behavior is revalidated and a Pi-native user experience is designed.

## Rationale

Pi packages support native extension tools and skills. A single tool keeps the model-facing surface small, lets the package own job/session authority consistently, and keeps raw executable/provider/worktree power behind operator-owned policy.

Official xAI docs checked on 2026-05-25 describe multiple Grok Build interfaces: TUI, headless mode, and ACP. This ADR does not choose an operational launch path. It only reserves the Pi tool shape and keeps launch-path selection behind future evidence and consent.

## Rejected alternatives

- multiple model-facing tools for doctor/start/status/result;
- MCP as the Pi integration surface;
- CDX/Codex dependency or bridge;
- raw xAI API as fallback for Grok Build delegation;
- TUI scraping;
- model-facing raw Grok Build flags, env, executable path, auth method, or provider account selectors;
- launching a `PATH` candidate without operator identity/consent policy.

## Consequences

- `doctor` remains safe and read-only.
- Any future action must fit the denial matrix and source/live evidence ladder.
- Package docs and tests must reject CDX/Codex/MCP product-path drift.
- Operator config owns launch policy and raw Grok Build knobs.
- Parent Pi remains final authority for acceptance, validation, commits, publication, and claims.
