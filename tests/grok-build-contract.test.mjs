import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const source = readFileSync(join(root, "extensions/grok-build/index.ts"), "utf8");
const schemaBlock = source.match(/const GrokBuildInputSchema[\s\S]*?\n\);/)?.[0] ?? "";

test("grok_build action enum is the bootstrap read-only pair", () => {
	assert.match(source, /const ACTIONS = \["doctor", "preflight"\] as const;/);
	assert.match(source, /const PACKAGE_VERSION = "0\.0\.4";/);
});

test("grok_build input schema stays narrow", () => {
	assert.match(schemaBlock, /additionalProperties: false/);
	assert.match(schemaBlock, /action: Type\.Optional\(StringEnum\(ACTIONS/);
	for (const forbidden of ["prompt", "cwd", "flag", "env", "credential", "executable", "artifact", "profile", "model"]) {
		assert.doesNotMatch(schemaBlock, new RegExp(forbidden, "i"), `schema should not expose ${forbidden}`);
	}
});

test("preflight is explicitly pre-operational", () => {
	for (const field of [
		"providerUse: false",
		"networkUse: false",
		"promptCarryingDelegation: false",
		"filesystemMutation: false",
		"artifactsWritten: false",
		"rawLaunchFieldsAccepted: false",
		"trustedIdentity: false",
		"launched: false",
	]) {
		assert.match(source, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
	}
	assert.match(source, /operational: false/);
});

test("bootstrap source keeps Grok Build process execution out of scope", () => {
	assert.doesNotMatch(source, /node:child_process/);
	assert.doesNotMatch(source, /\bspawn\s*\(/);
	assert.doesNotMatch(source, /\bexecFile\s*\(/);
	assert.doesNotMatch(source, /\bpi\.exec\s*\(/);
	assert.doesNotMatch(source, /grok inspect/);
	assert.doesNotMatch(source, /grok agent stdio/);
	assert.doesNotMatch(source, /--always-approve/);
});
