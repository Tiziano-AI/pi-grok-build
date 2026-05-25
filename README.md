# pi-grok-build

Pi-native integration for **xAI Grok Build**, the Grok coding agent/CLI.

This package exists to let Pi leverage Grok Build through a source-inspectable Pi extension and skill. It is intentionally independent from other coding-agent products and does not use MCP as the Pi integration surface.

## Status

`pi-grok-build@0.0.1` is a bootstrap/name-reservation release.

It currently provides:

- a Pi package manifest (`pi.extensions` + `pi.skills`)
- one read-only Pi tool, `grok_build`, with `action: "doctor"`
- one Pi skill, `pi-grok-build`
- public boundary docs and package-shape tests

It does **not** yet launch Grok Build, send prompts to xAI/Grok, edit worktrees, manage delegated sessions, or spend provider/subscription quota.

## Why this package exists

Grok Build is its own terminal coding agent. Pi should be able to delegate to it without pretending it is just a model provider and without depending on another agent's plugin transport.

The intended mature product shape is:

- Pi-native package and extension surfaces
- one model-facing `grok_build` tool
- curated lifecycle actions such as `start`, `status`, `result`, `cancel`, and `cleanup`
- bounded previews plus artifact paths for large outputs
- operator-owned configuration for raw Grok Build flags, auth/account state, and worktree policy
- explicit consent before launching Grok Build or sending prompt-carrying work to it

## Install from source during development

From a trusted local checkout:

```bash
pi install /absolute/path/to/pi-grok-build
```

For one-session testing without writing package settings:

```bash
pi -e /absolute/path/to/pi-grok-build
```

Then in Pi, the model may call:

```json
{ "action": "doctor" }
```

through the `grok_build` tool.

## Tool surface today

### `grok_build`

Read-only bootstrap doctor.

Input:

```json
{ "action": "doctor" }
```

Output reports whether `grok-build` or `grok` is present on `PATH`, and makes clear that this bootstrap release is not operational delegation.

## Development checks

```bash
npm test
npm run check:pack
git diff --check
```

`npm run check:pack` uses `npm pack --dry-run --json`; it does not create a tarball.

## Security posture

Pi packages run with the user's full local permissions. Review source before installing any Pi package, including this one.

This repo's bootstrap release intentionally avoids runtime dependencies, shelling out, network calls, credential reads, prompt-carrying Grok Build launches, and filesystem mutation.

## Non-goals

- no generic xAI/Grok model provider lane in this package's first surface
- no MCP bridge as the Pi surface
- no unreviewed third-party extension dependency
- no raw Grok Build flag DSL exposed to the model
