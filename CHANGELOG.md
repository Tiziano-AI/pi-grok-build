# Changelog

## 0.0.5 - 2026-05-27

- Reframes the README and package description around Pi delegating work to Grok Build as a managed collaborator.

## 0.0.4 - 2026-05-27

- Replaces the bootstrap diagnostic tool with the operational `grok_build` lifecycle: `start`, `send`, `status`, `result`, `changes`, `cancel`, `cleanup`.
- Moves `doctor` and `preflight` to `/grok-build` human diagnostics.
- Adds six curated profiles: `local-review`, `grounded-review`, `deep-research`, `worktree-edit`, `grounded-edit`, and `media`.
- Adds Grok ACP supervision through `grok agent stdio`.
- Adds package-owned session records, assigned edit worktrees, answer artifacts, change artifacts, copied media inputs, and copied generated media outputs.
- Adds a fixed `grok-build:fixed` widget with no footer status.
- Tightens cancellation, cleanup, media admission, and terminal-error behavior from live/provider testing.

## 0.0.3

- Published bootstrap package with read-only diagnostic actions.
