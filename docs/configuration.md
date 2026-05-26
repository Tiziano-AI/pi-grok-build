# Configuration

Current `0.0.x` configuration scope is intentionally small: `grok_build doctor` and `grok_build preflight` read `process.env.PATH` for executable-candidate discovery.

The bootstrap line introduces package-owned configuration with the future `start` contract. Current preflight reports that executable identity, consent, artifact, and output policies remain future launch gates.

## Future operator-owned config

A future operational release should define one package-owned config contract before implementing `start`.

Possible operator-owned fields:

| Field family | Model-facing? | Purpose |
| --- | ---: | --- |
| executable profile/path | No | Select and verify the Grok Build executable to launch. |
| launch profile | Model selects curated id only | Map to allowed Grok Build mode/flags. |
| consent/preauthorization | No | Record whether prompt-carrying use may proceed noninteractively. |
| cwd roots | No | Restrict delegated work to admitted repositories. |
| read-only/write profile | Model selects curated id only | Separate review from worktree mutation. |
| output limits | No | Bound status/result previews. |
| artifact root/retention | No | Own retained evidence and cleanup. |
| provider/auth posture | No | Reference local auth mode without storing or exposing secret values. |

## Package config boundaries

Package config should be a small, typed operator surface. Model-facing tool arguments should stay focused on curated action/profile/job choices while these authority sources remain in operator policy:

- raw launch flags;
- environment variables;
- arbitrary executable paths;
- credentials or auth file contents;
- provider account selectors;
- cleanup roots.

## Grok Build external config

Official xAI docs checked on 2026-05-26 describe Grok Build config, auth, permissions, sandbox profiles, skills, plugins, hooks, and enterprise requirements. Those may inform a future `pi-grok-build` config design. Package docs should cite current official docs or observed runtime behavior for external Grok Build semantics.

## Config readback

A mature release should include a safe config readback surface that reports origins, selected profile ids, and non-secret policy posture. Token values, API keys, auth file contents, and provider account secrets stay outside model-facing output.
