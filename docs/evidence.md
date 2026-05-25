# Evidence Ledger

Freshness date: 2026-05-25.

This ledger separates source proof, npm/package proof, Pi loader proof, doctor proof, live Grok Build proof, and deferred proof.

## External authority rows

| Source | Type | Checked | Claims used | Notes |
| --- | --- | --- | --- | --- |
| `https://docs.x.ai/build/overview` | Official xAI docs | 2026-05-25 | Grok Build supports TUI, headless use, ACP, install command, local auth/API-key paths. | Current source for product shape only, not package runtime proof. |
| `https://docs.x.ai/build/cli/headless-scripting` | Official xAI docs | 2026-05-25 | Headless `grok -p`, `--output-format plain/json/streaming-json`, ACP `grok agent stdio`. | Any runtime path still needs package ADR/proof before adoption. |
| `https://docs.x.ai/build/enterprise` | Official xAI docs | 2026-05-25 | Auth methods, network hosts, config layers, permissions, sandbox profiles, data lifecycle. | Do not quote credential values or assume local config. |
| `https://docs.x.ai/build/features/skills-plugins-marketplaces` | Official xAI docs | 2026-05-25 | Grok skills/plugins/hooks/subagents and compatibility surfaces. | These are Grok Build internals, not Pi package integration surfaces. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md` | Installed Pi docs | 2026-05-25 | Pi package manifest, package security warning, install/update/package source behavior. | Local installed docs are authoritative for this workstation's Pi semantics. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md` | Installed Pi docs | 2026-05-25 | `pi.registerTool`, tool output truncation, `StringEnum`, extension permissions. | Used for extension source contract. |
| `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/skills.md` | Installed Pi docs | 2026-05-25 | Skill discovery, package skill resources, skill security warning. | Used for skill/package contract. |

## Proof layers

| Evidence layer | What it proves | What it does not prove | Minimum current command/source |
| --- | --- | --- | --- |
| Source docs | Intended package contract and denial posture | Pi loaded the package; Grok Build works | tracked root docs and `docs/` |
| Extension source | Registered tool schema and implementation intent | Runtime tool visibility | `extensions/grok-build/index.ts` |
| Skill source | Model guidance when loaded | Live implicit skill selection | `skills/pi-grok-build/SKILL.md` |
| `package.json.pi` manifest | Declared Pi resources | Installed or active runtime resources | `package.json` |
| Static tests | Source/package-shape invariants | Runtime behavior | `npm test` |
| npm pack dry-run | Tarball file list and metadata candidate | Published registry state or installed behavior | `npm run check:pack` |
| npm registry metadata | Published version, dist-tags, tarball integrity | Source checkout parity, Pi runtime behavior | `npm view pi-grok-build ...` |
| Pi loader proof | Pi discovered extension/skill resources for one invocation | Grok Build live behavior | documented runtime/tool-list proof |
| `grok_build doctor` | Candidate executable discovery for one invocation | Login, subscription, prompt behavior, sandbox/worktree safety, delegation | Pi tool call result |
| No-prompt Grok Build probe | Future safe readiness if implemented | Prompt-carrying behavior | future explicit probe |
| Prompt-carrying live run | Future authorized delegation for one case | General correctness or all capabilities | future explicit provider-use proof |
| Artifact ledger | Retained output path/checksum/terminal state | Correctness without parent review | future package-owned artifact root |
| Cleanup proof | Package-owned artifact deletion for one job | Grok account/auth/Pi package teardown | future cleanup receipt |

## Current validation proof target

| Command | Target | Required status |
| --- | --- | --- |
| `npm test` | static package/control-plane invariants | pass |
| `npm run check:pack` | npm dry-run packlist | pass |
| `git diff --check` | whitespace | pass |

## Live proof denial

Do not claim any of these from source, docs, npm metadata, or pack output alone:

- Pi active runtime loaded the extension;
- a model can call `grok_build` in a specific session;
- Grok Build is installed correctly;
- the user is logged in or subscribed;
- prompt-carrying Grok Build delegation works;
- worktree mutation is safe;
- cleanup removed provider or package exposure state.

## Deferred proof

Operational lifecycle proof is deferred until this repo implements and tests a state machine, consent policy, executable identity policy, artifact contract, and launch path.
