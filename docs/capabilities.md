# Capabilities

## Lifecycle actions

| Action | Provider use | Mutation | Output |
| --- | --- | --- | --- |
| `start` | Yes | Profile-dependent | Session handle, cursor, artifact root. |
| `send` | Yes | Profile-dependent | Queued turn or structured denial. |
| `status` | No new provider use | No | Session state, cursor, wait receipt. |
| `result` | No new provider use | No | Answer preview/path, media paths, or terminal error. |
| `changes` | No new provider use | Reads assigned worktree | File list, diff path, summary path. |
| `cancel` | Signals owned worker | No | Cancel receipt. |
| `cleanup` | No | Deletes package-owned evidence | Deleted-path count. |

## Profiles

| Profile | Writes | Web/current | Media | Isolation |
| --- | ---: | ---: | ---: | --- |
| `local-review` | no | no | no | read-only sandbox |
| `grounded-review` | no | yes | no | read-only sandbox |
| `deep-research` | no | yes | no | read-only sandbox |
| `worktree-edit` | yes | no | no | assigned git worktree |
| `grounded-edit` | yes | yes | no | assigned git worktree |
| `media` | artifact only | no default | yes | artifact-first media flow |

## Media

Media input is local-file and ACP-resource based.

Accepted:

- absolute JPG, PNG, or WebP image paths;
- files under the admitted cwd or a previous package artifact root;
- at least 8 px per side and at least 512 total pixels.

Denied:

- URLs and data URIs;
- GIF, HEIC, HEIF, and unsupported extensions;
- inline binary or raw provider payloads;
- credential/control roots.

Generated image/video paths returned from Grok's local session store are copied into package-owned turn media artifacts.

## Worktree edits

`worktree-edit` and `grounded-edit` create a clean assigned git worktree under the session artifact root. `changes` reads that worktree and reports whether the parent workspace was mutated. Root `grok --worktree` is not the isolation primitive.
