# Privacy

## Current release

`pi-grok-build@0.0.x` stores no package-owned session state and sends no prompts to Grok Build or xAI.

The current `grok_build doctor` action returns:

- current Pi cwd;
- whether candidate executables named `grok-build` or `grok` are executable on `PATH`;
- bootstrap status text.

It does not read Grok credential files, account files, shell histories, project source files, or provider state.

## Future retained evidence

Future operational releases may need a package-owned artifact root for job ledgers, bounded previews, full output, receipts, and cleanup proof. Before implementation, this repo must document and test:

- artifact root ownership;
- job-id path safety;
- retention defaults;
- redaction policy;
- cleanup limits;
- what remains outside package control.

See [Artifacts and retention](docs/artifacts-and-retention.md).

## Provider data

When future prompt-carrying Grok Build launches are implemented, data handling depends on Grok Build's own mode, authentication, local configuration, and xAI/Grok infrastructure. `pi-grok-build` must not summarize those provider semantics from memory. It must cite current official xAI documentation or observed runtime behavior and label proof gaps.

## Local operator notes

Ignored `AGENTS.md`, `PLAN.md`, `HANDOFF.md`, `.pi/`, logs, sessions, and future artifact roots are local/runtime state. They are not npm package source and must not be treated as public proof unless explicitly copied into tracked release evidence with secrets excluded.
