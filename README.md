# pi-grok-build

Pi-native integration package for **xAI Grok Build**, the Grok coding agent/CLI.

This repo exists so Pi can leverage Grok Build through source-inspectable Pi package, extension, and skill surfaces. It is independent of Codex/CDX product surfaces and does not use MCP as the Pi integration surface.

## Status

`pi-grok-build` is still a `0.0.x` bootstrap.

The published `0.0.1` package reserved the name and shipped a source-inspectable, read-only doctor. Current source prepares the next bootstrap candidate with the public control-plane docs required before operational delegation.

Implemented today:

- Pi package manifest with `pi.extensions` and `pi.skills`
- one read-only Pi tool, `grok_build`, with `action: "doctor"`
- one Pi skill, `pi-grok-build`
- package-shape tests and npm pack dry-run gate
- public control-plane docs for capability, evidence, consent, security, release, and denial boundaries

Not implemented today:

- no Grok Build launch
- no prompt-carrying provider/subscription use
- no worktree edits
- no delegated sessions
- no background process supervision
- no artifact cleanup beyond static package checks

## Why this package exists

Grok Build is its own terminal coding agent. Pi should be able to delegate to it without pretending it is just a model provider and without depending on another agent harness transport.

The mature product target is:

- one Pi-native model-facing tool, `grok_build`
- curated lifecycle actions, not raw Grok Build flags
- operator-owned configuration for executable identity, launch policy, auth/account posture, cwd/worktree policy, output limits, and retention
- explicit consent before launching Grok Build or sending prompt-carrying work to xAI/Grok
- bounded previews plus retained artifact paths for full output
- source/live proof that separates package source, npm tarballs, Pi loader visibility, doctor output, and authorized live behavior

## Install

From npm after reviewing the published source:

```bash
pi install npm:pi-grok-build
```

From a trusted local checkout:

```bash
pi install /absolute/path/to/pi-grok-build
```

For one-session testing without writing package settings:

```bash
pi -e /absolute/path/to/pi-grok-build
```

## First success today

Ask Pi to use the `grok_build` tool with the only implemented action:

```json
{ "action": "doctor" }
```

The doctor reports whether `grok-build` or `grok` is discoverable on `PATH`. Treat that result as local executable-candidate evidence only. It does not prove Grok Build identity, login, subscription status, prompt behavior, sandbox/worktree safety, or delegation correctness.

## Control-plane docs

- [Architecture](ARCH.md)
- [Vision](VISION.md)
- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Terms](TERMS.md)
- [Release](RELEASE.md)
- [Control plane](docs/control-plane.md)
- [Capabilities](docs/capabilities.md)
- [Evidence ledger](docs/evidence.md)
- [Denial matrix](docs/denial-matrix.md)
- [Configuration](docs/configuration.md)
- [Consent and provider use](docs/consent-and-provider-use.md)
- [Artifacts and retention](docs/artifacts-and-retention.md)
- [Release provenance](docs/release-provenance.md)
- [ADR 0001: name and boundary](docs/adr-0001-name-and-boundary.md)
- [ADR 0002: Pi tool contract](docs/adr-0002-pi-tool-contract.md)

Local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` files are intentionally ignored. Durable public package policy belongs in the tracked docs above.

## Development checks

```bash
npm test
npm run check:pack
git diff --check
```

`npm run check:pack` uses `npm pack --dry-run --json`; it does not create a tarball.

## Security posture

Pi packages run with the user's full local permissions. Review source before installing any Pi package, including this one.

This bootstrap release intentionally avoids runtime dependencies, shelling out, network calls, credential reads, prompt-carrying Grok Build launches, and filesystem mutation.

## Non-goals

- no generic xAI/Grok model provider as this package's first surface
- no MCP bridge as the Pi integration surface
- no CDX/Codex dependency
- no unreviewed third-party runtime dependency
- no model-facing raw Grok Build flag DSL
