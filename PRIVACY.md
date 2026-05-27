# Privacy

`pi-grok-build` can send prompt-carrying work to Grok/xAI when `grok_build start` or `grok_build send` is called with explicit provider-use confirmation.

A live session may expose:

- task text;
- selected profile behavior;
- repository or file content Grok reads through its own tools;
- local media inputs attached to a media session;
- generated media and answer content.

The package stores local receipts, event logs, answer artifacts, copied media inputs, generated media copies, and edit diffs under its state root. `grok_build cleanup` removes retained package-owned evidence for an inactive addressed session.

Diagnostics such as `/grok-build doctor` and `/grok-build preflight` do not send prompts. The package does not read credential files, print tokens, or accept raw provider credentials in tool inputs.
