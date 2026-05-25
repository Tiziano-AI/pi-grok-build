# Security

## Bootstrap posture

`pi-grok-build@0.0.x` is intentionally non-operational. The current `grok_build doctor` action:

- does not launch Grok Build;
- does not shell out;
- does not call xAI, Grok, or any provider API;
- does not read credential files;
- does not mutate files;
- does not create background jobs;
- does not delete artifacts.

Pi packages and extensions run with the user's local permissions. Treat installation as a source-trust decision.

## Model-facing authority

The only accepted model-facing tool name is:

```text
grok_build
```

Current accepted action:

```text
doctor
```

Every other action is denied in `0.0.x`.

Future operational actions must keep raw authority behind operator-owned configuration. The model must not supply arbitrary executable paths, raw Grok Build flags, environment variables, credentials, auth methods, provider accounts, sandbox names, hook/plugin paths, or cleanup roots.

## Executable discovery

The doctor may report `grok-build` or `grok` candidates from `PATH`. That is candidate discovery only.

A future `start` implementation must not launch the first discovered `PATH` candidate by default. Launch requires at least one accepted policy:

- an operator-configured executable path/profile; or
- a documented identity/version verification path; and
- explicit per-run consent or a durable operator preauthorization policy.

The generic `grok` command name is ambiguous and must be treated as lower-trust than a configured executable path.

## Consent and provider use

Launching Grok Build can send prompts, source context, file contents, tool results, and account/subscription usage to xAI/Grok infrastructure depending on the Grok Build mode and local configuration. Future prompt-carrying actions require explicit authorization or a documented preauthorization config. See [Consent and provider use](docs/consent-and-provider-use.md).

## Worktree and filesystem safety

Future write-capable delegation must be profile-gated. It must define:

- admitted cwd rules;
- dirty-worktree handling;
- read-only versus write-capable profiles;
- artifact roots owned by this extension;
- path traversal and symlink-denial rules;
- actual filesystem/git readback for changes, not model-authored patch text.

Until those contracts are implemented and tested, `pi-grok-build` must not perform worktree mutation.

## Process and cleanup ownership

Future `cancel` may cancel only a process/job spawned and recorded by `pi-grok-build` for the addressed job id.

Future `cleanup` may delete only `pi-grok-build`-owned retained artifacts for the addressed job. It must not claim to delete:

- Grok account state;
- xAI provider state;
- Grok memory;
- Grok auth files;
- arbitrary Grok worktrees;
- Pi package installation state;
- active Pi tool exposure.

Uninstalling or disabling the Pi package is a separate Pi package-management action.

## Denial matrix

See [Denial matrix](docs/denial-matrix.md) for current and future fail-closed rows.
