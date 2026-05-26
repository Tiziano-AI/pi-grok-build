# pi-grok-build

Pi package for bringing **xAI Grok Build** into Pi as a source-inspectable extension, tool, and skill.

`pi-grok-build` gives Pi a native `grok_build` tool surface and package docs for operating Grok Build with explicit consent, retained evidence, and bounded output.

## Status

`pi-grok-build` is in the `0.0.x` bootstrap line.

Published `0.0.3` is the current foundational npm default. Current source is the `0.0.4` read-only readiness/preflight candidate: still pre-operational, with `doctor` plus foundational `preflight` evidence.

Current scope:

- Pi package manifest with `pi.extensions` and `pi.skills`
- read-only `grok_build` tool with `action: "doctor"` and `action: "preflight"`
- `pi-grok-build` skill
- package-shape and contract tests plus npm pack dry-run gate
- public docs for capability, evidence, consent, security, release, and authority boundaries

The doctor is the first-success package/environment path. Preflight is the read-only next-step proof before operational delegation.

## Product direction

Grok Build is a terminal coding agent with interactive, headless, and agent-protocol modes. Pi Grok Build provides a Pi-owned supervision layer around that product:

- one model-facing Pi tool: `grok_build`
- read-only bootstrap actions for discovery and preflight evidence
- curated lifecycle actions for future launch, status, results, cancellation, and cleanup
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

Ask Pi to use the `grok_build` tool for package/environment discovery:

```json
{ "action": "doctor" }
```

For foundational readiness evidence before any operational delegation design:

```json
{ "action": "preflight" }
```

The doctor reports whether `grok-build` or `grok` is discoverable on `PATH` and may include absolute candidate executable paths. Preflight returns a read-only checklist of executable-candidate evidence, current authority posture, and deferred launch gates. Treat both results as evidence for that invocation. Operational readiness requires the stronger proof ladder in [Evidence ledger](docs/evidence.md).

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

The bootstrap runtime scope is read-only discovery and preflight evidence with zero non-peer package dependencies, shell execution, network calls, credential reads, provider use, Grok Build process launch, or filesystem mutation.
