# Release

## Local gates

Run before packaging or publishing:

```bash
npm test
npm run check:pack
git diff --check
```

## Evidence to collect

Keep these claims separate:

- source changes and tests;
- package dry-run contents;
- Pi install/load evidence;
- npm registry state after publication;
- live/provider proof, if explicitly authorized and run.

## Publish rule

Run `npm publish` only with explicit human authorization for the exact package, version, and tag.

Normal public releases use the npm `latest` dist-tag. Use a preview tag only when the package is intentionally not ready to become the default Pi install.
