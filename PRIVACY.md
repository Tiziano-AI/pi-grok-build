# Privacy

## Current release

`pi-grok-build@0.0.x` is local and stateless. It keeps the bootstrap interaction inside package/environment discovery.

The current `grok_build doctor` action returns:

- current Pi cwd;
- whether candidate executables named `grok-build` or `grok` are executable on `PATH`;
- bootstrap status text.

It keeps Grok credential files, account files, shell histories, project source files, and provider state outside the current action.

## Future retained evidence

Future operational releases may need a package-owned artifact root for job ledgers, bounded previews, full output, receipts, and cleanup proof. Before implementation, this repo documents and tests:

- artifact root ownership;
- job-id path safety;
- retention defaults;
- redaction policy;
- cleanup limits;
- what remains outside package control.

See [Artifacts and retention](docs/artifacts-and-retention.md).

## Provider data

When future prompt-carrying Grok Build launches are implemented, data handling depends on Grok Build's own mode, authentication, local configuration, and xAI/Grok infrastructure. `pi-grok-build` cites current official xAI documentation or observed runtime behavior for those provider semantics and labels proof gaps.

## Local operator notes

Ignored `AGENTS.md`, `PLAN.md`, `HANDOFF.md`, `.pi/`, logs, sessions, and future artifact roots are local/runtime state. Public package source lives in tracked docs and package files.
