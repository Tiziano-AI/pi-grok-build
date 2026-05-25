# Security

## Bootstrap posture

`pi-grok-build@0.0.x` is a read-only bootstrap. The current `grok_build doctor` action performs executable-candidate discovery and returns structured status.

Current runtime behavior:

- reads `PATH` entries for candidate names;
- reports candidate paths when executable bits are present;
- returns bootstrap status and next-step guidance;
- keeps credentials, provider calls, shells, background jobs, and filesystem mutation outside the current action.

Pi packages and extensions run with the user's local permissions. Treat installation as a source-trust decision.

## Model-facing authority

The Pi model-facing tool is:

```text
grok_build
```

Current accepted action:

```text
doctor
```

Future operational actions keep raw authority behind operator-owned configuration. The public tool schema should expose curated profile ids and job controls, while executable paths, raw launch flags, environment variables, credentials, auth methods, provider accounts, sandbox names, hook/plugin paths, and cleanup roots remain policy/config concerns.

## Executable discovery

The doctor may report `grok-build` or `grok` candidates from `PATH`. That is candidate discovery.

A future `start` implementation needs a stronger launch policy, such as:

- an operator-configured executable path/profile; or
- a documented identity/version verification path; and
- explicit per-run consent or a durable operator preauthorization policy.

The generic `grok` command name is treated as an ambiguous candidate until accepted by launch policy.

## Consent and provider use

Launching Grok Build can send prompts, source context, file contents, tool results, and account/subscription usage to xAI/Grok infrastructure depending on the Grok Build mode and local configuration. Future prompt-carrying actions require explicit authorization or a documented preauthorization config. See [Consent and provider use](docs/consent-and-provider-use.md).

## Worktree and filesystem safety

Future write-capable delegation is profile-gated. It needs:

- admitted cwd rules;
- dirty-worktree handling;
- read-only versus write-capable profiles;
- artifact roots owned by this extension;
- path traversal and symlink controls;
- actual filesystem/git readback for changes.

## Process and cleanup ownership

Future `cancel` addresses only a process/job spawned and recorded by `pi-grok-build` for the addressed job id.

Future `cleanup` addresses only `pi-grok-build`-owned retained artifacts for the addressed job. Package cleanup is separate from Grok account state, xAI provider state, Grok memory, auth files, arbitrary worktrees, Pi package installation state, and active Pi tool exposure.

Uninstalling or disabling the Pi package is a separate Pi package-management action.

## Authority matrix

See [Authority matrix](docs/authority-matrix.md) for current and future authority rows.
