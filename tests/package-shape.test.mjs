import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const readText = (path) => readFileSync(join(root, path), "utf8");
const pkg = JSON.parse(readText("package.json"));

test("package identity and Pi manifest are canonical", () => {
	assert.equal(pkg.name, "pi-grok-build");
	assert.equal(pkg.version, "0.0.1");
	assert.equal(pkg.private, undefined);
	assert.deepEqual(pkg.pi.extensions, ["./extensions/grok-build/index.ts"]);
	assert.deepEqual(pkg.pi.skills, ["./skills"]);
	assert.ok(pkg.keywords.includes("pi-package"));
	assert.ok(pkg.keywords.includes("grok-build"));
	assert.equal(pkg.publishConfig.access, "public");
});

test("declared package files exist", () => {
	for (const path of [
		"README.md",
		"CHANGELOG.md",
		"LICENSE",
		"docs/adr-0001-name-and-boundary.md",
		"extensions/grok-build/index.ts",
		"skills/pi-grok-build/SKILL.md",
	]) {
		assert.ok(existsSync(join(root, path)), `${path} should exist`);
	}
});

test("bootstrap surface stays Pi-native and source-inspectable", () => {
	const corpus = [
		readText("README.md"),
		readText("AGENTS.md"),
		readText("docs/adr-0001-name-and-boundary.md"),
		readText("extensions/grok-build/index.ts"),
		readText("skills/pi-grok-build/SKILL.md"),
	].join("\n");
	assert.match(corpus, /grok_build/);
	assert.doesNotMatch(corpus, /cdx-grok/i);
	assert.doesNotMatch(corpus, /\.codex-plugin/i);
	assert.doesNotMatch(corpus, /mcp\s+serve\b/i);
	assert.equal(pkg.dependencies, undefined);
});
