---
name: pi-grok-build
description: "Use when operating or designing the Pi-native xAI Grok Build integration. Today this bootstrap skill supports source-aware package guidance plus read-only grok_build doctor and preflight actions."
license: MIT
---

# pi-grok-build

## Outcome

Use this skill when the user asks Pi to operate, inspect, or extend the `pi-grok-build` package: a Pi-native integration for xAI Grok Build.

Current bootstrap status: the package is source-inspectable and registers a read-only `grok_build` tool with `doctor` and `preflight` actions.

## Operating scope

- Use `grok_build` with `action: "doctor"` for package/environment discovery.
- Use `grok_build` with `action: "preflight"` for foundational read-only readiness evidence.
- Require explicit live/provider-use authorization before launching Grok Build or sending prompt-carrying work to xAI/Grok.
- Keep raw Grok Build flags, executable paths, env vars, credentials, and provider/account selectors behind operator-owned configuration.
- Use inspected source before adding runtime dependencies.
- Treat local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` as ignored checkout/session notes, not portable package source.

## First success today

Use the `grok_build` tool for package/environment discovery:

```json
{ "action": "doctor" }
```

Use preflight for foundational readiness evidence:

```json
{ "action": "preflight" }
```

Interpret both results as invocation-local evidence. Operational readiness requires the proof ladder in `docs/evidence.md`.

## Public docs to read before changes

- `README.md` for current first-success behavior.
- `ARCH.md` and `docs/control-plane.md` before changing runtime boundaries.
- `docs/capabilities.md` before adding or describing actions.
- `docs/authority-matrix.md` before accepting new inputs or authority.
- `docs/evidence.md` and `docs/release-provenance.md` before making proof or release claims.
- `docs/consent-and-provider-use.md` before any prompt-carrying or provider/subscription work.
- `docs/artifacts-and-retention.md` before retaining output or implementing cleanup.

## Future design target

The mature package should keep one model-facing tool, `grok_build`, with a small lifecycle contract such as `start`, `status`, `result`, `cancel`, and `cleanup`.

The package should provide bounded previews, retained artifacts for full output, explicit consent before provider use, and operator-owned configuration for Grok Build launch policy.

## Evidence discipline

- Source files prove source intent.
- A package manifest proves declared Pi resources.
- npm metadata proves registry publication.
- A doctor result proves local executable discovery for that invocation.
- A preflight result proves package-local readiness evidence and deferred gates for that invocation.
- A future live Grok Build run needs observed runtime output, retained artifacts, and explicit authorization for provider/subscription use.
