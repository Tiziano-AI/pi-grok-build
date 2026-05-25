# Configuration

No operational configuration is implemented in `0.0.x`.

The current package has no config file, no environment-variable contract, no executable override, no profile system, and no artifact root setting. `grok_build doctor` reads only `process.env.PATH` for candidate discovery.

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

## Denied config paths

Do not use these as package config contracts:

- raw model-supplied Grok Build flags;
- prompt-supplied environment variables;
- arbitrary paths supplied in a tool call;
- CDX/Codex config roots;
- Pi session `.pi/` state;
- Grok credential files;
- undocumented local dotfiles.

## Grok Build external config

Official xAI docs checked on 2026-05-25 describe Grok Build config, auth, permissions, sandbox profiles, skills, plugins, hooks, and enterprise requirements. Those may inform a future `pi-grok-build` config design, but the package must not claim to own or validate Grok Build's full config without current official docs or observed runtime proof.

## Config readback

A mature release should include a safe config readback surface that reports origins, selected profile ids, and non-secret policy posture. It must not print token values, API keys, auth file contents, or provider account secrets.
