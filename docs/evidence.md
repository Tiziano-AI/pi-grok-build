# Evidence

Evidence proves only the surface it observes.

## Source/package evidence

These commands prove source and package shape:

```bash
npm test
npm run check:pack
git diff --check
```

They do not prove that Pi loaded the package, Grok is authenticated, or provider calls work.

## Pi runtime evidence

Pi runtime claims need observed package/tool/command/widget discovery in the active Pi harness. Source files and package manifests are not enough.

## Native Grok evidence

`/grok-build doctor` and `/grok-build preflight` can prove local non-prompt facts such as `grok` discovery and `grok agent stdio` help availability. They do not prove a prompt can run.

## Live/provider evidence

Live claims require explicit authorization plus observed `grok_build` behavior for the relevant action, profile, and option. Authorization alone is not proof of behavior.

## Worktree evidence

Write-capable proof needs:

- clean parent repo before start;
- assigned package-owned worktree creation;
- Grok launched with the assigned worktree as cwd;
- pre-prompt worktree proof event;
- `changes` readback from the assigned worktree;
- parent mutation status.

## Media evidence

Media proof needs:

- local input admission and copy/hash evidence;
- MIME and dimension checks;
- ACP `embeddedContext` capability proof;
- ACP `resource` block with `blob` transport;
- copied output artifact paths for generated media.
