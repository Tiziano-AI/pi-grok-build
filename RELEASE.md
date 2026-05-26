# Release

## Version and publication posture

`0.0.1` was the name-reservation bootstrap release. `0.0.2` was the first public control-plane bootstrap.

Current source is `0.0.3`, the foundational positive-posture bootstrap candidate. It remains a pre-1.0 doctor-only package; publishing it as npm `latest` means current default install, not feature completeness. Agent-side publication requires explicit authorization for the exact package, version, and tag.

One version must align across:

- `package.json`
- `CHANGELOG.md`
- npm package candidate output
- Git tag when a release is cut
- npm dist-tags after publication

## Required source gates

Run from a clean source checkout before packaging or asking a human to publish:

```bash
npm test
npm run check:pack
git diff --check
```

`npm run gate` runs those checks together.

## Package proof

`npm run check:pack` must show that the tarball includes the source-inspectable public contract:

- `README.md`
- `ARCH.md`
- `VISION.md`
- `SECURITY.md`
- `PRIVACY.md`
- `TERMS.md`
- `RELEASE.md`
- `CHANGELOG.md`
- `LICENSE`
- `docs/**/*.md`
- `extensions/**/*.ts`
- `skills/**/*.md`

The package candidate keeps local/runtime material outside the tarball: `.pi/`, local `AGENTS.md`, local `PLAN.md`, local `HANDOFF.md`, `node_modules/`, generated tarballs, caches, and secrets.

## Pi resource proof

Source and npm pack proof cover package files. Pi resource proof is the next layer.

Minimum non-provider Pi proof for a release candidate:

1. Pi can discover the packaged skill command from the source or installed package.
2. Pi can expose the `grok_build` tool from the package extension in a current runtime/tool-list proof.
3. The `grok_build doctor` action can be called without launching Grok Build.

A failed or unavailable Pi runtime smoke is a proof gap unless it identifies a package-specific load error.

## Live Grok Build proof

Bootstrap doctor releases require source/package and Pi resource proof only.

Future prompt-carrying proof requires explicit provider/subscription-use authorization and records:

- exact command/path used;
- consent source;
- cwd and profile;
- output/artifact paths;
- terminal state;
- known provider/live proof limits.

## Post-publish checks

After a human publishes a package version, verify without exposing secrets:

```bash
npm view pi-grok-build name version dist-tags repository.url dist.integrity --json
npm pack pi-grok-build@<version> --dry-run --json
```

Installed/loaded claims additionally require Pi package/runtime proof.

For `0.0.3`, the intended current-default registry state is:

```text
latest -> 0.0.3
bootstrap -> 0.0.3
```

## Rollback and teardown

Session cleanup, package uninstall, and npm dist-tags are separate controls.

- Future `cleanup` removes only package-owned artifacts for one job.
- `pi remove npm:pi-grok-build` or `pi config` controls Pi package exposure.
- npm dist-tags control registry default installation behavior.

Artifact deletion, Pi tool-exposure teardown, and npm package rollback each need their own receipt.
