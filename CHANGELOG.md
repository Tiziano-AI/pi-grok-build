# Changelog

## 0.0.2 - Unreleased

- Bootstrap the public control-plane docs: architecture, vision, security, privacy, terms, release, capabilities, evidence, denial, configuration, consent, artifacts, release provenance, and Pi tool ADR.
- Move durable package policy out of tracked `AGENTS.md`; local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` are now ignored operator/session notes.
- Tighten package metadata so the bootstrap package does not overclaim operational delegation.
- Align Pi core peer dependency ranges with Pi package documentation.

## 0.0.1 - 2026-05-25

- Reserve the `pi-grok-build` package, repository, Pi tool, and Pi skill identity.
- Add a source-inspectable bootstrap Pi package with a read-only `grok_build` doctor tool.
- Document the product boundary: Pi-native Grok Build integration, no alternate coding-agent dependency, no MCP bridge as the Pi surface, and no unaudited package install path.
