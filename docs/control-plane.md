# Pi Grok Build Control Plane

This is the durable public control plane for `pi-grok-build`.

Local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` files are ignored on purpose. Pi may load them as local checkout/session notes, but stable package policy belongs in tracked source docs.

## Product boundary

- Package name: `pi-grok-build`
- Human-facing name: Pi Grok Build
- Pi model-facing tool: `grok_build`
- Pi skill: `pi-grok-build`
- Current implemented action: `doctor`
- Current package phase: `0.0.x` bootstrap

The package is independent of CDX/Codex product surfaces. It must not import, shell out to, wrap, document, or rely on another agent harness as the product path.

MCP is not the Pi integration surface for this package. If Grok Build itself supports MCP or ACP internally, that is Grok Build behavior and requires a separate `pi-grok-build` ADR before it becomes a package runtime edge.

## Current source truth

`grok_build doctor` checks candidate executable discovery and returns bootstrap status. It is read-only and non-operational.

Current source does not:

- launch Grok Build;
- send prompts;
- spend provider/subscription quota;
- read credentials;
- edit worktrees;
- supervise sessions;
- cancel processes;
- cleanup artifacts.

## Future contract discipline

Before any operational action is implemented, the public docs and tests must define:

- exact action schema;
- state machine and terminal states;
- job id ownership;
- consent policy;
- executable identity and launch policy;
- cwd/worktree policy;
- artifact root and retention;
- bounded model-facing output;
- cancellation and cleanup ownership;
- source/live proof requirements;
- denial rows for every raw or ambiguous authority path.

## Validation expectations

Bootstrap source gates:

```bash
npm test
npm run check:pack
git diff --check
```

Runtime or live claims require stronger proof named in [Evidence ledger](evidence.md). Source files, docs, npm metadata, package manifests, and dry-run packlists do not prove active Pi runtime loading or Grok Build behavior by themselves.

## Development posture

- Documentation/control-plane updates precede runtime authority expansion.
- Keep the model-facing surface small.
- Prefer one canonical owner for every action, state, config key, artifact path, and proof lane.
- Do not add compatibility aliases or fallback runtimes to make a local patch easier.
- Do not install source-uninspectable internet packages as runtime dependencies.
- Treat Grok Build output as evidence, not final acceptance.
