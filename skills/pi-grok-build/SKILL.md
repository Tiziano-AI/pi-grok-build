---
name: pi-grok-build
description: "Use when operating or designing the Pi-native xAI Grok Build integration. Today this bootstrap skill supports source-aware package guidance and the read-only grok_build doctor; it is not a generic xAI provider, CDX/Codex bridge, or MCP integration surface."
license: MIT
---

# pi-grok-build

## Outcome

Use this skill when the user asks Pi to operate, inspect, or extend the `pi-grok-build` package: a Pi-native integration for xAI Grok Build.

Current bootstrap status: the package is source-inspectable but not yet an operational delegation bridge. It registers a read-only `grok_build` doctor tool only.

## Hard rules

- Do not depend on CDX/Codex product surfaces for this package.
- Do not propose MCP as the Pi integration surface.
- Do not install or depend on source-uninspectable internet packages.
- Do not launch Grok Build or send prompt-carrying work to xAI/Grok unless the user explicitly authorizes that live/provider use.
- Do not expose raw Grok Build flags, executable paths, env vars, credentials, or provider/account selectors as model-facing inputs.
- Treat local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` as ignored checkout/session notes, not portable package source.

## First success today

Use the `grok_build` tool with the only implemented action:

```json
{ "action": "doctor" }
```

Interpret the result as local executable-candidate evidence only. It does not prove Grok Build identity, login state, subscription status, prompt behavior, worktree safety, or delegation correctness.

## Public docs to read before changes

- `README.md` for current first-success behavior.
- `ARCH.md` and `docs/control-plane.md` before changing runtime boundaries.
- `docs/capabilities.md` before adding or describing actions.
- `docs/denial-matrix.md` before accepting new inputs or authority.
- `docs/evidence.md` and `docs/release-provenance.md` before making proof or release claims.
- `docs/consent-and-provider-use.md` before any prompt-carrying or provider/subscription work.
- `docs/artifacts-and-retention.md` before retaining output or implementing cleanup.

## Future design target

The mature package should keep one model-facing tool, `grok_build`, with a small lifecycle contract such as `start`, `status`, `result`, `cancel`, and `cleanup`.

The package should provide bounded previews, retained artifacts for full output, explicit consent before provider use, and operator-owned configuration for Grok Build launch policy.

## Evidence discipline

- Source files prove source intent only.
- A package manifest proves declared Pi resources, not active runtime loading.
- npm metadata proves registry publication, not installed Pi behavior.
- A doctor result proves only local executable discovery for that invocation.
- A future live Grok Build run must be proven by observed runtime output, retained artifacts, and explicit authorization for provider/subscription use.
