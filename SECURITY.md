# Security

`pi-grok-build` is a local Pi extension. It launches Grok only through `grok agent stdio`, and only `start` and `send` send prompt-carrying work.

## Main guardrails

- `start` and `send` require `confirm_provider_use:true` after explicit authorization.
- The model-facing schema does not accept raw executable paths, raw argv, auth files, arbitrary environment variables, URLs as media input, or raw provider payloads.
- Write profiles require a clean parent git repository and edit only a package-owned assigned worktree.
- `changes` is denied while a turn is active and reads only the assigned worktree.
- `cleanup` deletes package-owned retained evidence only and is denied while active.
- Media input admission denies credential/control roots such as `.grok`, `.ssh`, `.aws`, and gcloud config.
- Secrets and raw auth material are not printed, copied into artifacts, or accepted as tool inputs.

## Reporting

Report security issues through the repository issue tracker or a private maintainer channel. Do not include secrets, tokens, or private provider output in public reports.
