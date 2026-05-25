# Release

## Version and publication posture

`0.0.1` was the name-reservation bootstrap release.

Current source is `0.0.2` and remains a bootstrap candidate unless and until the human publishes it. Agents must not run `npm publish` without explicit authorization for the exact package, version, and tag.

One version must align across:

- `package.json`
- `CHANGELOG.md`
- npm package candidate output
- Git tag when a release is cut

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

It must not include `.pi/`, local `AGENTS.md`, local `PLAN.md`, local `HANDOFF.md`, `node_modules/`, generated tarballs, caches, or secrets.

## Pi resource proof

Package source and npm pack proof do not prove Pi loaded the package.

Minimum non-provider Pi proof for a release candidate:

1. Pi can discover the packaged skill command from the source or installed package.
2. Pi can expose the `grok_build` tool from the package extension in a current runtime/tool-list proof.
3. The `grok_build doctor` action can be called without launching Grok Build.

A failed or unavailable Pi runtime smoke is a proof gap, not a source failure, unless it identifies a package-specific load error.

## Live Grok Build proof

No live Grok Build proof is required for the bootstrap doctor package.

Any future prompt-carrying proof requires explicit provider/subscription-use authorization and must record:

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

Do not claim a newly published version is installed or loaded in Pi until Pi package/runtime proof exists.

## Rollback and teardown

Session cleanup, package uninstall, and npm dist-tags are separate controls.

- Future `cleanup` removes only package-owned artifacts for one job.
- `pi remove npm:pi-grok-build` or `pi config` controls Pi package exposure.
- npm dist-tags control registry default installation behavior.

Do not confuse artifact deletion with active Pi tool-exposure teardown or npm package rollback.
