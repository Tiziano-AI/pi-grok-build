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

The package is a Pi-native integration for xAI Grok Build.

## Rationale

`pi-grok-build` follows common Pi package naming: `pi-` plus the capability. It preserves the official product phrase Grok Build and is specific enough to describe the package's intended surface.

The first published package version, `0.0.1`, is a source-inspectable bootstrap. It reserves the name and exposes a read-only doctor tool while the lifecycle contract is designed. Later `0.0.x` releases add read-only preflight evidence while keeping operational lifecycle work deferred.

## Boundaries

- Pi integration uses Pi package, extension, tool, and skill APIs.
- Raw Grok Build launch policy and account/auth posture stay behind operator-owned configuration.
- Prompt-carrying Grok Build launches require an explicit future consent contract.
- Runtime dependencies must have inspectable source before adoption.

## Consequences

Bootstrap releases should be clearly labeled as bootstrap/name-reservation releases. A non-production npm dist-tag such as `bootstrap` is preferred unless the human intentionally wants a version to be the default `latest` install.

The mature release can later add lifecycle actions to `grok_build` while keeping `doctor` as the safe first-success probe and `preflight` as foundational readiness evidence.
