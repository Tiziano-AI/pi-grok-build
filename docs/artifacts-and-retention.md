# Artifacts and retention

`pi-grok-build` keeps model output compact and stores full evidence as local artifacts.

## State root

Default:

```text
~/.pi/agent/pi-grok-build
```

Overrides:

```text
PI_GROK_BUILD_HOME
PI_CODING_AGENT_DIR/pi-grok-build
```

## Session files

A session can contain:

```text
sessions/<internal-id>/session.json
sessions/<internal-id>/events.jsonl
sessions/<internal-id>/artifacts/turns/<turn>/answer.md
sessions/<internal-id>/artifacts/turns/<turn>/inputs/*
sessions/<internal-id>/artifacts/turns/<turn>/media/*
sessions/<internal-id>/artifacts/changes.json
sessions/<internal-id>/artifacts/changes.diff
sessions/<internal-id>/artifacts/execution-worktree/
```

The assigned worktree exists only for write-capable profiles.

## Cleanup

`grok_build cleanup` deletes package-owned evidence for one inactive session. It can remove the assigned worktree and session artifacts. It does not stage, commit, delete, or rewrite parent repository files.

Cleanup is denied while a turn is active; cancel first when stopping an active run.

## Output bounds

Tool responses include session state, cursor, wait receipt, answer preview or artifact path, media artifact paths, and change artifact paths. Full answers, diffs, copied inputs, copied generated media, and event logs stay on disk.
