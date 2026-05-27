# Pi Grok Build

Use Grok Build from Pi as a managed collaborator.

`pi-grok-build` is a Pi package that gives Pi one tool, `grok_build`, for delegating review, research, candidate edits, and media work to Grok Build without leaving the Pi session. Pi stays the parent agent: it starts Grok work, waits for results, sends follow-ups, inspects artifacts, cancels stale work, and decides what to accept.

The package is source-inspectable and deliberately small:

- `grok_build` for model-facing delegation;
- `/grok-build` for human diagnostics;
- a fixed widget for active sessions, failures, and diagnostics;
- retained artifacts for answers, copied inputs, generated media, and edit diffs;
- explicit consent before prompt-carrying work goes to Grok/xAI.

The backend runtime is `grok agent stdio` over ACP. No `grok -p`, raw xAI API path, TUI scraping, relay, or fallback runtime is part of the product.

## Install

From npm:

```bash
pi install npm:pi-grok-build
```

From a local checkout:

```bash
pi install /absolute/path/to/pi-grok-build
```

Reload Pi after installation or source changes before expecting the active tool surface to change.

## Delegate with `grok_build`

Model-facing tool:

```text
grok_build
```

Actions:

```text
start | send | status | result | changes | cancel | cleanup
```

Use it when the Pi parent should ask Grok Build to do sidecar work:

- get a second review of a local repository;
- run grounded research through Grok;
- prepare candidate edits in an isolated worktree;
- generate or edit media and return artifact paths;
- continue the same Grok session with follow-up instructions.

`doctor` and `preflight` are not model-facing actions. They are human diagnostics under `/grok-build`.

## Human command

```text
/grok-build doctor
/grok-build preflight
/grok-build status g1
/grok-build result g1
/grok-build changes g1
/grok-build cancel g1
/grok-build cleanup g1
```

`/grok-build start` and `/grok-build send` ask for interactive confirmation before sending prompt-carrying work to Grok/xAI.

## Profiles

Choose the narrowest profile that can do the job.

| Profile | Use for | Writes | Web/current evidence | Media |
| --- | --- | ---: | ---: | ---: |
| `local-review` | local source or repo review | no | no | no |
| `grounded-review` | repo review with current external evidence | no | yes | no |
| `deep-research` | broader research or decomposition | no | yes | no |
| `worktree-edit` | candidate edits without web | yes | no | no |
| `grounded-edit` | candidate edits with current evidence | yes | yes | no |
| `media` | image/video generation or editing | artifact only | no by default | yes |

## Typical use

Delegate a review:

```json
{
  "action": "start",
  "cwd": "/absolute/git/workspace",
  "profile": "local-review",
  "task": "Review this repository for API drift and report the highest-risk findings.",
  "confirm_provider_use": true
}
```

Wait for the collaborator's answer:

```json
{ "action": "result", "session": "g1", "wait_seconds": 30, "preview": true }
```

Send a follow-up into the same Grok session:

```json
{
  "action": "send",
  "session": "g1",
  "task": "Now focus on the CLI surface and release risks.",
  "confirm_provider_use": true
}
```

Inspect candidate edit-session changes:

```json
{ "action": "changes", "session": "g1", "preview": true }
```

Stop and remove retained evidence:

```json
{ "action": "cancel", "session": "g1", "reason": "User stopped the run." }
{ "action": "cleanup", "session": "g1" }
```

## Consent

`start` and `send` can send prompts, repository context, local artifacts, and selected tool behavior to Grok/xAI through the locally authenticated Grok CLI. They require `confirm_provider_use:true` after explicit current authorization.

Diagnostics, install checks, and old successful runs do not grant provider-use consent.

## Worktrees

Write-capable profiles require a clean parent git repository. The package creates a session-owned assigned git worktree under its artifact root and launches Grok there. The parent repository is not the edit target. `changes` reads the assigned worktree and reports files and diff artifacts.

Root `grok --worktree` is not used as the isolation primitive, and there is no model-facing worktree knob.

## Media

Media inputs are local image files only:

- accepted: absolute JPG, PNG, or WebP paths under the admitted workspace or a prior package artifact root;
- denied: URLs, GIF/HEIC/HEIF, inline payloads, credential/control roots, unsupported extensions, and images smaller than 8 px per side or 512 total pixels;
- transport: copied, hashed, checked, and sent as ACP embedded `resource` blobs after `embeddedContext` proof;
- output: generated image/video files returned by Grok are copied into package-owned turn media artifacts.

## Widget

The fixed widget key is `grok-build:fixed`. It shows active sessions, failed sessions that need attention, and diagnostics. Completed and explicitly cancelled sessions are not alerts. The package does not use a footer status or dashboard shell.

## Validation

For source/package changes run:

```bash
npm test
npm run check:pack
git diff --check
```

Live/provider proof is separate and requires explicit authorization before any prompt-carrying Grok run.
