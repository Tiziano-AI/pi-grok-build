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
	"docs/authority-matrix.md",
	"docs/configuration.md",
	"docs/consent-and-provider-use.md",
	"docs/artifacts-and-retention.md",
	"docs/release-provenance.md",
];

const requiredExtensionFiles = [
	"extensions/grok-build/index.ts",
	"extensions/grok-build/src/acp-client.ts",
	"extensions/grok-build/src/changes.ts",
	"extensions/grok-build/src/cwd-policy.ts",
	"extensions/grok-build/src/grok-launch.ts",
	"extensions/grok-build/src/input-artifacts.ts",
	"extensions/grok-build/src/ledger.ts",
	"extensions/grok-build/src/native.ts",
	"extensions/grok-build/src/output-artifacts.ts",
	"extensions/grok-build/src/paths.ts",
	"extensions/grok-build/src/profiles.ts",
	"extensions/grok-build/src/rendering.ts",
	"extensions/grok-build/src/schemas.ts",
	"extensions/grok-build/src/service.ts",
	"extensions/grok-build/src/types.ts",
];

test("package identity and Pi manifest are canonical", () => {
	assert.equal(pkg.name, "pi-grok-build");
	assert.equal(pkg.version, "0.0.6");
	assert.equal(pkg.private, undefined);
	assert.equal(pkg.description, "Use Grok Build from Pi as a managed collaborator for review, research, edits, and media.");
	assert.deepEqual(pkg.pi.extensions, ["./extensions/grok-build/index.ts"]);
	assert.deepEqual(pkg.pi.skills, ["./skills"]);
	assert.ok(pkg.keywords.includes("pi-package"));
	assert.ok(pkg.keywords.includes("pi-extension"));
	assert.ok(pkg.keywords.includes("pi-coding-agent"));
	assert.ok(pkg.keywords.includes("grok-build"));
	assert.equal(pkg.publishConfig.access, "public");
});

test("Pi-bundled core imports stay peer-only", () => {
	assert.equal(pkg.dependencies, undefined);
	assert.deepEqual(pkg.peerDependencies, {
		"@earendil-works/pi-ai": "*",
		"@earendil-works/pi-coding-agent": "*",
		"@earendil-works/pi-tui": "*",
		typebox: "*",
	});
});

test("declared public package files exist", () => {
	for (const path of [...requiredPublicDocs, ...requiredExtensionFiles, "skills/pi-grok-build/SKILL.md"]) {
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

test("operational surface is positive, Pi-native, and source-inspectable", () => {
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
		"docs/authority-matrix.md",
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
	assert.match(corpus, /start \| send \| status \| result \| changes \| cancel \| cleanup/);
	assert.match(corpus, /doctor.*preflight/s);
	assert.match(corpus, /slash\/operator/i);
	assert.match(corpus, /source-inspectable/i);
	assert.match(corpus, /assigned git worktree/i);
	assert.match(corpus, /fixed widget/i);
	assert.match(corpus, /Pi package/);
	assert.match(corpus, /Grok Build/);
	assert.match(corpus, /managed collaborator/i);
	assert.match(corpus, /delegat/i);
	assert.doesNotMatch(corpus, new RegExp("Non" + "-goals", "i"));
	assert.doesNotMatch(corpus, new RegExp("Reject" + "ed alternatives", "i"));
	assert.doesNotMatch(corpus, /only implemented action/i);
});
