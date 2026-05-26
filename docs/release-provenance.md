# Release Provenance

This document defines the source-to-user proof ladder for `pi-grok-build`.

## Lineage rows

| Row | Proof surface | Claim ceiling |
| --- | --- | --- |
| Source checkout | `git status`, tracked files, tests | Source contract. |
| Package candidate | `npm pack --dry-run --json` | Files and metadata that would ship. |
| Published npm package | `npm view`, registry tarball integrity | Registry publication and dist-tag state. |
| Installed Pi package | `pi list`, package settings, installed package path | Package installed/configured for a Pi scope. |
| Pi runtime loaded resources | current Pi loader/tool/command proof | Extension/skill visible for that invocation. |
| Tool execution | `grok_build doctor`, `grok_build preflight`, or future action result | Behavior for that invocation. |
| Live Grok Build run | authorized runtime artifacts | Provider/live behavior for that job. |

## Current release lane

For `0.0.x`, release proof is source/package/bootstrap proof:

```bash
npm test
npm run check:pack
git diff --check
npm view pi-grok-build name version dist-tags repository.url dist.integrity gitHead --json
```

The published `0.0.1`, `0.0.2`, and `0.0.3` packages prove prior bootstrap registry presence. Current source `0.0.4` needs a human publish action before registry claims can name that version.

## Dist-tags

`0.0.x` releases are bootstrap releases. For the foundational current-default state, use both `latest` and `bootstrap` on the current published version: `latest` marks the default install, while `0.0.x` and the docs communicate bootstrap maturity.

Npm dist-tag changes are human-owned release actions and require explicit authorization.

## Installed/runtime proof

Source and npm proof are earlier layers. To claim that `grok_build` is active in Pi, capture current Pi runtime evidence that lists or calls the tool from the intended package source.

To claim the skill is visible, capture current Pi command/resource evidence that includes `skill:pi-grok-build` from the intended package source.

## Live behavior proof

Live Grok Build proof is deferred until an operational release exists and provider/subscription use is authorized. A future no-prompt Grok Build readiness probe and a prompt-carrying run are separate proof layers. Current `grok_build preflight` is package-local preflight evidence; Grok Build process execution belongs to a future launch-policy lane.
