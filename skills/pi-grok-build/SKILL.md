---
name: pi-grok-build
description: "Grok Build supervision: operate, test, and maintain Pi Grok Build through grok_build, /grok-build, assigned worktrees, media artifacts, and fixed-widget evidence. Requires explicit provider-use authorization for start/send."
---
# Pi Grok Build

Use this skill for agent work involving `pi-grok-build`, `grok_build`, `/grok-build`, Grok Build sidecar sessions from Pi, assigned Grok edit worktrees, media artifacts, package docs, extension code, tests, or release readiness.

Do not use this skill for generic Grok usage outside Pi, raw xAI API work, unrelated Pi extensions, or publishing without exact human authorization.

## Public surfaces

Model-facing tool:

```text
grok_build
```

Actions:

```text
start | send | status | result | changes | cancel | cleanup
```

Human/operator command:

```text
/grok-build
```

`doctor` and `preflight` are slash/operator diagnostics only. Never call `grok_build` with diagnostic actions.

## Authorization rule

Before `grok_build start` or `grok_build send`, require explicit live/provider-use authorization for the current run or a specific operator preauthorization policy. Set `confirm_provider_use:true` only after that authorization exists.

No provider-use authorization is needed for source review, docs, tests, package dry-runs, Pi schema/load probes without a provider, or `/grok-build doctor/preflight` diagnostics.

## Profile routing

Use the narrowest profile:

- `local-review`: local repo/source review; no writes; no web.
- `grounded-review`: local review plus current external evidence; no writes.
- `deep-research`: broad research or decomposition; no local writes.
- `worktree-edit`: candidate edits in a package-owned assigned git worktree; no web.
- `grounded-edit`: assigned-worktree candidate edits plus current evidence.
- `media`: image/video generation or editing; artifact-first output.

## Tool workflow

1. For `start`, pass an absolute git `cwd`, a profile, a concrete task, and `confirm_provider_use:true` only when authorized.
2. Use `result(wait_seconds)` as the primary wait/read path. Use `preview:true` only when answer text belongs in context.
3. Use `status` for compact state, cursor, and wait receipts.
4. Use `send` for same-session follow-ups only after provider-use authorization.
5. Use `changes` only after `worktree-edit` or `grounded-edit` sessions are inactive.
6. Use `cancel` only for explicit stop, obsolete work, unsafe work, or stuck sessions.
7. Use `cleanup` only after retained evidence is no longer needed. Cleanup deletes package-owned artifacts/worktrees only.

Treat Grok answers, media, and diffs as evidence until the Pi parent or human validates and accepts them.

## Worktree rules

Write-capable profiles require a clean parent git repo. The package creates an assigned worktree under the session artifact root and launches Grok there. Do not rely on root `grok --worktree`; do not treat candidate diffs as accepted parent-repo changes.

`changes` reads the assigned worktree. It is denied while a turn is active and unavailable for read-only profiles.

## Media rules

Media inputs must be existing absolute local JPG, PNG, or WebP files under the admitted cwd or a previous package artifact root. URLs, data URIs, GIF/HEIC/HEIF, credential/control roots, unsupported extensions, and images below 8 px per side or 512 total pixels are denied.

Inputs are copied, hashed, dimension-checked, and sent as ACP embedded `resource` blobs after `embeddedContext` proof. Generated image/video paths returned by Grok are copied into package-owned turn media artifacts.

## Package maintenance workflow

For source/docs/tests/package changes:

1. Inspect dirty state with `git status -sb`.
2. Read the relevant public docs before changing contracts: `README.md`, `ARCH.md`, `docs/control-plane.md`, `docs/capabilities.md`, `docs/authority-matrix.md`, and `docs/consent-and-provider-use.md`.
3. Keep human docs simple and public; keep this skill precise for agents.
4. Keep local operator notes out of the package: `AGENTS.md`, `PLAN.md`, `HANDOFF.md`, `.pi/`, `.DS_Store`, caches, and package archives must stay ignored/unpublished.
5. Update docs, source, tests, and skill text together when the public contract changes.
6. Validate with:

```bash
npm test
npm run check:pack
git diff --check
```

Use Pi load/schema probes for runtime exposure claims. Use live/provider probes only with explicit authorization.

Never run `npm publish` without explicit human authorization for the exact package, version, and tag.
