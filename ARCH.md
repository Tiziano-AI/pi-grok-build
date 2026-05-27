# Architecture

`pi-grok-build` is a Pi-native supervisor that lets Pi use Grok Build as a managed collaborator. Pi stays the parent authority. Grok runs as a sidecar through ACP over `grok agent stdio`.

## Public surfaces

- Model tool: `grok_build`
- Tool actions: `start | send | status | result | changes | cancel | cleanup`
- Human command: `/grok-build`
- Widget key: `grok-build:fixed`

`doctor` and `preflight` are slash/operator diagnostics. They are not model-facing tool actions.

## Runtime boundary

The only backend runtime is:

```text
grok --no-auto-update --cwd <execution-cwd> --sandbox <profile> --always-approve ... agent --no-leader stdio
```

Excluded runtime paths: headless `grok -p`, terminal/TUI scraping, raw xAI API calls, relay/WebSocket backends, and root `grok --worktree` as an edit-isolation primitive.

## Source layout

- `extensions/grok-build/index.ts`: registers the tool, slash command, and widget.
- `extensions/grok-build/src/schemas.ts`: closed model-facing schema.
- `extensions/grok-build/src/profiles.ts`: six curated profiles.
- `extensions/grok-build/src/service.ts`: lifecycle dispatcher.
- `extensions/grok-build/src/ledger.ts`: session, turn, and event records.
- `extensions/grok-build/src/acp-client.ts`: ACP process supervision.
- `extensions/grok-build/src/grok-launch.ts`: profile-to-Grok argv mapping.
- `extensions/grok-build/src/cwd-policy.ts`: git workspace admission and cleanliness.
- `extensions/grok-build/src/changes.ts`: assigned worktrees and diff artifacts.
- `extensions/grok-build/src/input-artifacts.ts`: local media input admission and ACP resource blocks.
- `extensions/grok-build/src/output-artifacts.ts`: copied generated media artifacts.
- `extensions/grok-build/src/native.ts`: local slash diagnostics.
- `extensions/grok-build/src/rendering.ts`: compact tool rendering and fixed widget.

## State

Default state root:

```text
~/.pi/agent/pi-grok-build
```

A session has a public handle such as `g1`, an internal id, a profile, turns, events, and artifacts.

Turn states:

```text
queued -> sent -> streaming -> completed
queued|sent|streaming -> failed|cancelled|dropped
```

Session states:

```text
starting | turn_active | idle | failed | cancelled | cleaned
```

## Worktree isolation

Write-capable profiles use assigned worktrees:

1. admit a cwd inside a git repository;
2. require a clean parent repository;
3. create a package-owned worktree under the session artifact root;
4. launch Grok with that worktree as `--cwd`;
5. record pre-prompt worktree proof;
6. read `changes` from that worktree only.

The parent repository remains the source of truth until a human or Pi parent accepts the diff.

## Media flow

Media inputs are local files. The package copies them, hashes them, checks extension and dimensions, denies credential/control roots, and sends ACP `resource` blocks only after Grok advertises `embeddedContext`.

Generated image/video paths returned by Grok from its local session store are copied into package-owned turn media artifacts and then reported as paths.

## Consent and authority

`start` and `send` require explicit provider-use confirmation. Pi or the human keeps authority for validation, commits, publication, credentials, and destructive decisions.

## UI

The widget is fixed, compact, and width-bounded. It shows active sessions, failed sessions that need attention, and diagnostics. Explicitly cancelled sessions are stopped history, not alerts. The package does not use a footer status.

## Validation

```bash
npm test
npm run check:pack
git diff --check
```

Runtime claims need Pi load evidence. Provider claims need explicit authorization and observed live Grok behavior.
