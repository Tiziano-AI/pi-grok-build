# ADR 0001: Name and product boundary

## Status

Accepted for bootstrap.

## Decision

Use the unscoped npm package and repository name `pi-grok-build`.

Use these public identities:

- npm package: `pi-grok-build`
- GitHub repository: `Tiziano-AI/pi-grok-build`
- display name: Pi Grok Build
- Pi tool: `grok_build`
- Pi skill: `pi-grok-build`

The package is a Pi-native integration for xAI Grok Build. It is not a generic Grok model provider and not a wrapper around another coding-agent product.

## Rationale

`pi-grok-build` follows common Pi package naming: `pi-` plus the capability. It preserves the official product phrase Grok Build, avoids broad `pi-grok` ambiguity, and avoids any CDX/Codex identity.

The first package version is a source-inspectable bootstrap. It reserves the name and exposes only a read-only doctor tool while the lifecycle contract is designed.

## Boundaries

- Pi integration uses native Pi extension, tool, command, and skill APIs.
- MCP is not the Pi integration surface.
- Raw Grok Build flags and account/auth details stay behind operator-owned configuration.
- Prompt-carrying Grok Build launches require an explicit future consent contract.
- Source-uninspectable internet packages are not acceptable dependencies.

## Consequences

The bootstrap can be published early under a non-`latest` npm dist-tag to reserve the name without claiming mature operational behavior.

The mature release can later add lifecycle actions to `grok_build` while keeping `doctor` as the safe first-success probe.
