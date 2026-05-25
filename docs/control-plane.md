# Pi Grok Build Control Plane

This is the durable public control plane for `pi-grok-build`.

Local `AGENTS.md`, `PLAN.md`, and `HANDOFF.md` files are ignored on purpose. Pi may load them as local checkout/session notes, but stable package policy belongs in tracked source docs.

## Product identity

- Package name: `pi-grok-build`
- Human-facing name: Pi Grok Build
- Pi model-facing tool: `grok_build`
- Pi skill: `pi-grok-build`
- Current implemented action: `doctor`
- Current package phase: `0.0.x` bootstrap

`pi-grok-build` packages a Pi extension and skill for supervising Grok Build from Pi. The package owns the Pi-facing tool contract, job authority, artifact discipline, and proof ladder.

## Current source truth

`grok_build doctor` checks executable candidates and returns bootstrap status. It is a read-only package and environment discovery action.

Current source scope:

- package resource discovery through `package.json.pi`;
- a source-inspectable extension entrypoint;
- a source-inspectable skill;
- public docs for future operational contracts;
- static tests and npm pack proof.

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
- authority rows for every raw or ambiguous launch path.

## Validation expectations

Bootstrap source gates:

```bash
npm test
npm run check:pack
git diff --check
```

Runtime and live claims require stronger proof named in [Evidence ledger](evidence.md). Source files, docs, npm metadata, package manifests, and dry-run packlists prove source/package state only.

## Development posture

- Documentation/control-plane updates precede runtime authority expansion.
- Keep the model-facing surface small.
- Prefer one canonical owner for every action, state, config key, artifact path, and proof lane.
- Use inspected source for runtime dependencies.
- Treat Grok Build output as evidence until Pi or the human accepts it.
