# Consent and Provider Use

## Current release

`0.0.x` performs no provider/subscription use. `grok_build doctor` does not launch Grok Build and does not send prompts.

## Why consent matters

A future `start` action can cause Grok Build to process user prompts, repository context, file contents, tool output, and local environment-derived policy through Grok Build/xAI infrastructure depending on the selected mode and local configuration.

Official xAI docs checked on 2026-05-25 describe browser login, device auth, external auth providers, API keys, network hosts, headless mode, and ACP. Those are external authority facts, not permission for `pi-grok-build` to use them automatically.

## Consent contract for future launch

Before launching Grok Build, a future implementation must have one of:

1. explicit per-run user authorization in the current task/session; or
2. an operator-owned preauthorization config that specifically admits the action/profile/cwd/mode.

The model must not manufacture consent from package source, npm install state, PATH discovery, or prior unrelated tasks.

## Required launch receipt

Future prompt-carrying launches must record a non-secret receipt with:

- consent source;
- selected profile id;
- admitted cwd;
- executable identity/path policy;
- provider/live-use classification;
- output/artifact root;
- start time and terminal state;
- proof gaps.

## Denials

Deny launch when:

- consent is absent;
- config is missing or ambiguous;
- the executable candidate is ambiguous and not operator accepted;
- cwd is denied or not admitted;
- worktree mutation would occur under a read-only profile;
- requested output would be unbounded;
- the request asks for secrets, raw auth files, or provider credential values.
