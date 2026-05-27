# Configuration

The model-facing configuration is intentionally small. The model chooses a profile and passes a task; the package owns launch policy.

## State root

Resolution order:

1. `PI_GROK_BUILD_HOME`;
2. `PI_CODING_AGENT_DIR/pi-grok-build`;
3. `~/.pi/agent/pi-grok-build`.

## Profiles

Allowed profile ids:

```text
local-review | grounded-review | deep-research | worktree-edit | grounded-edit | media
```

There is no `profiles.*.worktree` knob. Write isolation comes from the profile and is implemented with package-owned assigned worktrees.

## Consent field

`start` and `send` require:

```json
{ "confirm_provider_use": true }
```

That field is a receipt for current explicit authorization or a specific operator preauthorization policy. Package presence, PATH discovery, diagnostics, and prior runs are not consent.

## Raw Grok knobs

The schema does not accept arbitrary executable paths, argv, auth files, environment variables, worktree labels, or provider payloads. Curated profiles compile to Grok argv inside the extension.
