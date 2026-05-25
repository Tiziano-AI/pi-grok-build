# AGENTS.md - pi-grok-build

This repository owns the Pi-native integration for xAI Grok Build.

## Product boundary

- The package name is `pi-grok-build`; the human-facing name is Pi Grok Build.
- The core product is Grok Build, the xAI coding agent/CLI, exposed through Pi-native extension and skill surfaces.
- This repo must stay independent from CDX/Codex product surfaces. Do not import, shell out to, wrap, or document any CDX/Codex plugin, MCP server, skill, config, cache, or home directory as the product path.
- Do not make MCP the Pi integration surface. If Grok Build itself supports MCP internally, treat that as Grok Build behavior, not as the Pi package contract.
- Do not install, vendor, or depend on source-uninspectable internet packages. Source must be readable before adoption.

## Current bootstrap state

`0.0.x` is a name-reservation/source scaffold. It registers only the read-only `grok_build` doctor tool and a Pi skill. It does not launch Grok Build, spend provider quota, edit worktrees, or manage sessions.

## Implementation posture

- Prefer one model-facing Pi tool, `grok_build`, with explicit lifecycle actions when delegation is implemented.
- Keep raw Grok Build flags, provider/account details, and local auth behind operator-owned configuration rather than model-facing inputs.
- Bound all model-facing output. Large logs or artifacts must be truncated with a path to retained full output.
- Launching Grok Build, sending prompts to it, or using subscription/provider state requires explicit live/provider-use authorization until this repo has a mature consent contract.
- Before mutation, run `git status -sb` and preserve unrelated local/runtime files, especially `.pi/`.

## Validation

Use these non-provider checks for the bootstrap package:

```bash
npm test
npm run check:pack
git diff --check
```

Do not run `npm publish` from an agent unless the human explicitly authorizes it for that exact package/version/tag.
