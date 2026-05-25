# Release Provenance

This document defines the source-to-user proof ladder for `pi-grok-build`.

## Lineage rows

| Row | Proof surface | Claim ceiling |
| --- | --- | --- |
| Source checkout | `git status`, tracked files, tests | Source contract only. |
| Package candidate | `npm pack --dry-run --json` | Files and metadata that would ship. |
| Published npm package | `npm view`, registry tarball integrity | Registry publication and dist-tag state. |
| Installed Pi package | `pi list`, package settings, installed package path | Package installed/configured for a Pi scope. |
| Pi runtime loaded resources | current Pi loader/tool/command proof | Extension/skill visible for that invocation. |
| Tool execution | `grok_build doctor` or future action result | Behavior for that invocation only. |
| Live Grok Build run | authorized runtime artifacts | Provider/live behavior for that job only. |

## Current release lane

For `0.0.x`, release proof is limited to source/package/bootstrap behavior:

```bash
npm test
npm run check:pack
git diff --check
npm view pi-grok-build name version dist-tags repository.url dist.integrity --json
```

The published `0.0.1` package proves name reservation and registry presence. It does not prove current source `0.0.2` is published.

## Dist-tags

`0.0.x` releases are bootstrap releases. Prefer a non-production dist-tag such as `bootstrap` unless the human intentionally wants the package on `latest`.

Agents must not change npm dist-tags without explicit authorization.

## Installed/runtime proof

Source and npm proof are not loader proof. To claim that `grok_build` is active in Pi, capture current Pi runtime evidence that lists or calls the tool from the intended package source.

To claim the skill is visible, capture current Pi command/resource evidence that includes `skill:pi-grok-build` from the intended package source.

## Live behavior proof

Live Grok Build proof is deferred until an operational release exists and provider/subscription use is authorized. A no-prompt readiness probe and a prompt-carrying run are separate proof layers.
