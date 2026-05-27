# Consent and provider use

`grok_build start` and `grok_build send` can send prompt-carrying work to Grok/xAI through the locally authenticated Grok CLI.

Prompt-carrying work can include task text, selected profile behavior, repository context Grok reads through its own tools, local media inputs, and generated artifacts.

## Rule

A prompt-carrying action proceeds only when the request contains:

```json
{ "confirm_provider_use": true }
```

That value is valid only after one of:

1. explicit authorization for the current run; or
2. a specific operator-owned preauthorization policy that admits the action, profile, cwd, and mode.

Diagnostics, installation, PATH discovery, slash help, and old authorization do not grant consent.

## Slash command behavior

`/grok-build start` and `/grok-build send` ask for interactive confirmation before setting `confirm_provider_use:true`. Non-interactive slash use does not auto-confirm provider use.

## Receipts

A live launch records non-secret evidence such as action, profile, admitted cwd, launch runtime, artifact root, session state, and structured errors. Secrets, tokens, raw credential files, and provider internals are not printed or copied into model-facing output.
