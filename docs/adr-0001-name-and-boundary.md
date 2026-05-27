# ADR 0001: Name and boundary

## Status

Accepted.

## Decision

The package is named `pi-grok-build`.

Public surfaces:

- model-facing tool: `grok_build`;
- human slash command: `/grok-build`;
- skill: `pi-grok-build`;
- fixed widget key: `grok-build:fixed`.

The package supervises Grok Build through the locally installed `grok agent stdio` ACP runtime.

## Boundary

`pi-grok-build` owns:

- typed lifecycle schema;
- curated profile policy;
- session, turn, and event records;
- package-owned artifact roots;
- assigned git worktrees for write-capable profiles;
- local media input admission;
- copied generated media artifacts;
- slash diagnostics and fixed widget state.

It does not own raw xAI APIs, Grok credentials, human acceptance of output, commits, publication, or destructive repository decisions.
