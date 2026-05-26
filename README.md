# pi-grok-build

Pi package for bringing **xAI Grok Build** into Pi as a source-inspectable extension, tool, and skill.

`pi-grok-build` gives Pi a native `grok_build` tool surface and package docs for operating Grok Build with explicit consent, retained evidence, and bounded output.

## Status

`pi-grok-build` is in the `0.0.x` bootstrap line.

Published `0.0.1` reserved the package name and shipped the first source-inspectable doctor. Current source is the `0.0.3` foundational bootstrap candidate: current default install posture, still doctor-only and pre-operational.

Current scope:

- Pi package manifest with `pi.extensions` and `pi.skills`
- read-only `grok_build` tool with `action: "doctor"`
- `pi-grok-build` skill
- package-shape tests and npm pack dry-run gate
- public docs for capability, evidence, consent, security, release, and authority boundaries

The doctor is the first-success path. Operational delegation is the next design phase.

## Product direction

Grok Build is a terminal coding agent with interactive, headless, and agent-protocol modes. Pi Grok Build will provide a Pi-owned supervision layer around that product:

- one model-facing Pi tool: `grok_build`
- curated lifecycle actions for launch, status, results, cancellation, and cleanup
- operator-owned launch profiles and executable identity policy
- explicit consent before prompt-carrying provider/subscription use
- bounded previews with artifact paths for full evidence
- source/package/Pi-loader/live-proof separation

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

The doctor reports whether `grok-build` or `grok` is discoverable on `PATH`. Treat the result as executable-candidate evidence for that invocation. Operational readiness requires the stronger proof ladder in [Evidence ledger](docs/evidence.md).

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
- [Authority matrix](docs/authority-matrix.md)
- [Configuration](docs/configuration.md)
- [Consent and provider use](docs/consent-and-provider-use.md)
- [Artifacts and retention](docs/artifacts-and-retention.md)
- [Release provenance](docs/release-provenance.md)
- [ADR 0001: name and boundary](docs/adr-0001-name-and-boundary.md)
- [ADR 0002: Pi tool contract](docs/adr-0002-pi-tool-contract.md)

Local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` files are ignored checkout/session notes. Durable package policy belongs in the tracked docs above.

## Development checks

```bash
npm test
npm run check:pack
git diff --check
```

`npm run check:pack` uses `npm pack --dry-run --json` without leaving a tarball behind.

## Security posture

Pi packages run with the user's full local permissions. Review source before installing any Pi package, including this one.

The bootstrap runtime scope is read-only candidate discovery with zero runtime dependencies, shell execution, network calls, credential reads, provider use, or filesystem mutation.
