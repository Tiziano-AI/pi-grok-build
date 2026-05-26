# Consent and Provider Use

## Current release

`0.0.x` performs read-only package/environment discovery and foundational preflight evidence. `grok_build doctor` is the first-success action. `grok_build preflight` is the pre-operational readiness evidence action.

## Why consent matters

A future `start` action can cause Grok Build to process user prompts, repository context, file contents, tool output, and local environment-derived policy through Grok Build/xAI infrastructure depending on the selected mode and local configuration.

Official xAI docs checked on 2026-05-26 describe browser login, device auth, API keys, network hosts, headless mode, and agent-protocol mode. Those are external authority facts. `pi-grok-build` turns them into package behavior only through its own config, consent, and proof contract.

## Consent contract for future launch

Before launching Grok Build, a future implementation needs one of:

1. explicit per-run user authorization in the current task/session; or
2. an operator-owned preauthorization config that specifically admits the action/profile/cwd/mode.

Consent receipts come from current user authorization or explicit operator config, not from package presence, PATH discovery, preflight, or unrelated prior tasks.

## Required launch receipt

Future prompt-carrying launches should record a non-secret receipt with:

- consent source;
- selected profile id;
- admitted cwd;
- executable identity/path policy;
- provider/live-use classification;
- output/artifact root;
- start time and terminal state;
- proof gaps.

## Launch readiness checks

A launch proceeds when policy establishes:

- consent or preauthorization;
- unambiguous config;
- accepted executable identity;
- cwd inside admitted roots;
- write-capable profile for worktree mutation;
- bounded or artifact-backed output;
- secret and raw-auth material kept outside the tool request and model-facing output.
