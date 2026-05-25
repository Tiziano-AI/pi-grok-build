import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const readText = (path) => readFileSync(join(root, path), "utf8");
const pkg = JSON.parse(readText("package.json"));
const gitignore = readText(".gitignore");

const requiredPublicDocs = [
	"README.md",
	"ARCH.md",
	"VISION.md",
	"SECURITY.md",
	"PRIVACY.md",
	"TERMS.md",
	"RELEASE.md",
	"CHANGELOG.md",
	"LICENSE",
	"docs/adr-0001-name-and-boundary.md",
	"docs/adr-0002-pi-tool-contract.md",
	"docs/control-plane.md",
	"docs/capabilities.md",
	"docs/evidence.md",
	"docs/denial-matrix.md",
	"docs/configuration.md",
	"docs/consent-and-provider-use.md",
	"docs/artifacts-and-retention.md",
	"docs/release-provenance.md",
];

test("package identity and Pi manifest are canonical", () => {
	assert.equal(pkg.name, "pi-grok-build");
	assert.equal(pkg.version, "0.0.2");
	assert.equal(pkg.private, undefined);
	assert.equal(pkg.description, "Bootstrap Pi package for a source-inspectable xAI Grok Build integration.");
	assert.deepEqual(pkg.pi.extensions, ["./extensions/grok-build/index.ts"]);
	assert.deepEqual(pkg.pi.skills, ["./skills"]);
	assert.ok(pkg.keywords.includes("pi-package"));
	assert.ok(pkg.keywords.includes("grok-build"));
	assert.equal(pkg.publishConfig.access, "public");
});

test("Pi-bundled core imports stay peer-only", () => {
	assert.equal(pkg.dependencies, undefined);
	assert.deepEqual(pkg.peerDependencies, {
		"@earendil-works/pi-ai": "*",
		"@earendil-works/pi-coding-agent": "*",
		typebox: "*",
	});
});

test("declared public package files exist", () => {
	for (const path of [
		...requiredPublicDocs,
		"extensions/grok-build/index.ts",
		"skills/pi-grok-build/SKILL.md",
	]) {
		assert.ok(existsSync(join(root, path)), `${path} should exist`);
	}
});

test("package files include the public control plane", () => {
	for (const path of ["ARCH.md", "VISION.md", "SECURITY.md", "PRIVACY.md", "TERMS.md", "RELEASE.md"]) {
		assert.ok(pkg.files.includes(path), `package files should include ${path}`);
	}
	assert.ok(pkg.files.includes("docs/**/*.md"));
	assert.ok(pkg.files.includes("extensions/**/*.ts"));
	assert.ok(pkg.files.includes("skills/**/*.md"));
});

test("local operator notes are ignored, not public source contract", () => {
	for (const path of ["AGENTS.md", "PLAN.md", "HANDOFF.md", ".pi/"]) {
		assert.match(gitignore, new RegExp(`(^|\\n)${path.replace(".", "\\.")}(\\n|$)`), `${path} should be ignored`);
	}
});

test("bootstrap surface stays Pi-native and source-inspectable", () => {
	const corpus = [
		"README.md",
		"ARCH.md",
		"VISION.md",
		"SECURITY.md",
		"PRIVACY.md",
		"TERMS.md",
		"RELEASE.md",
		"docs/adr-0001-name-and-boundary.md",
		"docs/adr-0002-pi-tool-contract.md",
		"docs/control-plane.md",
		"docs/capabilities.md",
		"docs/evidence.md",
		"docs/denial-matrix.md",
		"docs/configuration.md",
		"docs/consent-and-provider-use.md",
		"docs/artifacts-and-retention.md",
		"docs/release-provenance.md",
		"extensions/grok-build/index.ts",
		"skills/pi-grok-build/SKILL.md",
	]
		.map(readText)
		.join("\n");
	assert.match(corpus, /grok_build/);
	assert.match(corpus, /doctor/);
	assert.match(corpus, /source-inspectable/i);
	assert.doesNotMatch(corpus, /cdx-grok/i);
	assert.doesNotMatch(corpus, /\.codex-plugin/i);
	assert.doesNotMatch(corpus, /mcp\s+serve\b/i);
});
