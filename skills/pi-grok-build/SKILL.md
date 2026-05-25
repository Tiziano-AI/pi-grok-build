---
name: pi-grok-build
description: "Use when operating or designing the Pi-native xAI Grok Build integration. Today this bootstrap skill only supports source-aware package guidance and the read-only grok_build doctor; it is not a generic xAI provider or MCP bridge."
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
- Do not expose raw Grok Build flags as model-facing inputs. Future delegation should use curated profiles and lifecycle actions.

## First success today

Use the `grok_build` tool with the only implemented action:

```json
{ "action": "doctor" }
```

Interpret the result as local availability evidence only. It does not prove Grok Build login state, subscription status, prompt behavior, worktree safety, or delegation correctness.

## Future design target

The mature package should keep one model-facing tool, `grok_build`, with a small lifecycle contract such as `start`, `status`, `result`, `cancel`, and `cleanup`.

The package should provide bounded previews, retained artifacts for full output, explicit consent before provider use, and operator-owned configuration for Grok Build launch policy.

## Evidence discipline

- Source files prove source intent only.
- A package manifest proves Pi can discover declared resources only after Pi loader/runtime proof.
- A doctor result proves only local executable discovery for that invocation.
- A future live Grok Build run must be proven by observed runtime output, retained artifacts, and explicit authorization for provider/subscription use.
