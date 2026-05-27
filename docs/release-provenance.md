# Release provenance

A release claim needs separate evidence for source, package, registry, Pi installation, and live runtime behavior.

## Source gate

```bash
npm test
npm run check:pack
git diff --check
```

## Package gate

`npm run check:pack` must show the intended package id, version, file list, and no unexpected entries. Public package files are docs, extension TypeScript, skill markdown, `package.json`, and the license.

## Registry gate

`npm view pi-grok-build ...` proves registry state only after publication. A local version number does not prove npm availability.

## Pi install gate

`pi list` and active Pi tool/command/widget discovery prove installed Pi exposure. Source and registry metadata do not prove the active harness loaded the package.

## Live gate

Live Grok behavior requires explicit provider-use authorization and observed tool calls. Do not turn source/package proof into provider/runtime claims.

## Publication

Run `npm publish` only with explicit human authorization for the exact package, version, and tag.
