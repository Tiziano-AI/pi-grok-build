# Evidence Ledger

Freshness date: 2026-05-26.

This ledger names each proof layer and the maximum claim it supports.

## External authority rows

| Source | Type | Checked | Claims used | Use in this repo |
| --- | --- | --- | --- | --- |
| `https://docs.x.ai/build/overview` | Official xAI docs | 2026-05-26 | Grok Build supports TUI, headless use, agent-protocol mode, install command, local auth/API-key paths, custom model config, and `grok inspect`. | Product-shape source. Runtime claims require package proof. |
| `https://docs.x.ai/build/cli/headless-scripting` | Official xAI docs | 2026-05-26 | Headless `grok -p`, `--output-format plain/json/streaming-json`, agent-protocol `grok agent stdio`, auth method examples. | Launch-path source for future ADRs and tests. |
| `https://docs.x.ai/build/modes-and-commands` | Official xAI docs | 2026-05-26 | Plan mode, permission modes, `--always-approve`, TUI commands, `/usage`, `/logout`. | Provider/config and mode source for future design. |
| `https://x.ai/news/grok-build-cli` | Official xAI news | 2026-05-26 | Grok Build launch, early beta, subscription boundary, headless mode, subagents/worktrees. | Product positioning source. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md` | Installed Pi docs | 2026-05-26 | Pi package manifest, package security warning, install/update/package source behavior. | Local installed Pi package semantics for this workstation. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md` | Installed Pi docs | 2026-05-26 | `pi.registerTool`, tool output truncation, `StringEnum`, extension permissions. | Extension source contract. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/skills.md` | Installed Pi docs | 2026-05-26 | Skill discovery, package skill resources, skill security warning. | Skill/package contract. |

## Proof layers

| Evidence layer | Claim supported | Additional proof required for stronger claims | Minimum current command/source |
| --- | --- | --- | --- |
| Source docs | Intended package contract and authority posture | Pi loader proof and runtime behavior | tracked root docs and `docs/` |
| Extension source | Registered tool schema and implementation intent | Current runtime tool visibility | `extensions/grok-build/index.ts` |
| Skill source | Guidance available when the skill is loaded | Live implicit skill selection | `skills/pi-grok-build/SKILL.md` |
| `package.json.pi` manifest | Declared Pi resources | Installed or active runtime resources | `package.json` |
| Static tests | Source/package-shape/action-schema invariants | Runtime behavior | `npm test` |
| npm pack dry-run | Tarball file list and metadata candidate | Published registry state or installed behavior | `npm run check:pack` |
| npm registry metadata | Published version, dist-tags, tarball integrity | Source checkout parity and Pi runtime behavior | `npm view pi-grok-build ...` |
| Pi loader proof | Pi discovered extension/skill resources for one invocation | Grok Build live behavior | current runtime/tool-list proof |
| `grok_build doctor` | Candidate executable discovery for one invocation | Login, subscription, prompt behavior, sandbox/worktree safety, delegation | Pi tool call result |
| `grok_build preflight` | Foundational read-only readiness evidence for one invocation | Prompt-carrying behavior, subscription fitness, worktree safety, delegation correctness | Pi tool call result |
| No-prompt Grok Build probe | Future readiness signal for one accepted executable/profile | Prompt-carrying behavior | future explicit probe |
| Prompt-carrying live run | Future authorized delegation for one case | General correctness or all capabilities | future explicit provider-use proof |
| Artifact ledger | Retained output path/checksum/terminal state | Parent acceptance and validation | future package-owned artifact root |
| Cleanup proof | Package-owned artifact deletion for one job | Provider account/auth changes or Pi package teardown | future cleanup receipt |

## Current validation proof target

| Command | Target | Required status |
| --- | --- | --- |
| `npm test` | static package/control-plane invariants | pass |
| `npm run check:pack` | npm dry-run packlist | pass |
| `git diff --check` | whitespace | pass |

## Claims that require live proof

Capture current runtime evidence before claiming:

- Pi active runtime loaded the extension;
- a model can call `grok_build` in a specific session;
- Grok Build is installed correctly;
- the user is logged in or subscribed;
- prompt-carrying Grok Build delegation works;
- worktree mutation is safe;
- cleanup removed provider or package exposure state.

## Deferred proof

Operational lifecycle proof is deferred until this repo implements and tests a state machine, consent policy, executable identity policy, artifact contract, and launch path.
