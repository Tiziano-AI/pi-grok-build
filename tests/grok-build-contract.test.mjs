import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const readText = (path) => readFileSync(join(root, path), "utf8");
const entry = readText("extensions/grok-build/index.ts");
const types = readText("extensions/grok-build/src/types.ts");
const schemas = readText("extensions/grok-build/src/schemas.ts");
const service = readText("extensions/grok-build/src/service.ts");
const launch = readText("extensions/grok-build/src/grok-launch.ts");
const changes = readText("extensions/grok-build/src/changes.ts");
const inputArtifacts = readText("extensions/grok-build/src/input-artifacts.ts");
const outputArtifacts = readText("extensions/grok-build/src/output-artifacts.ts");
const rendering = readText("extensions/grok-build/src/rendering.ts");
const { providerErrorReceipt } = await import("../extensions/grok-build/src/acp-client.ts");
const { admitAndCopyInputs, InputAdmissionError } = await import("../extensions/grok-build/src/input-artifacts.ts");
const { harvestMediaOutputArtifacts } = await import("../extensions/grok-build/src/output-artifacts.ts");

test("grok_build model-facing actions are the operational lifecycle only", () => {
	assert.match(types, /MODEL_ACTIONS = \["start", "send", "status", "result", "changes", "cancel", "cleanup"\] as const/);
	assert.match(schemas, /export const GrokBuildInputSchema = Type\.Object/);
	assert.match(schemas, /action: StringEnum\(MODEL_ACTIONS\)/);
	assert.match(schemas, /additionalProperties: false/);
	assert.match(schemas, /Operational actions only/);
	assert.doesNotMatch(schemas, /doctor/);
	assert.doesNotMatch(schemas, /preflight/);
	assert.match(entry, /Do not ask grok_build for doctor or preflight/);
});

test("doctor and preflight are slash diagnostics", () => {
	assert.match(entry, /pi\.registerCommand\("grok-build"/);
	assert.match(entry, /command === "doctor"/);
	assert.match(entry, /command === "preflight"/);
	assert.match(entry, /diagnosticDetails\("doctor"/);
	assert.match(entry, /diagnosticDetails\("preflight"/);
});

test("six cdx-grok-aligned profiles are canonical", () => {
	assert.match(types, /PROFILE_IDS = \["local-review", "grounded-review", "deep-research", "worktree-edit", "grounded-edit", "media"\] as const/);
	for (const id of ["local-review", "grounded-review", "deep-research", "worktree-edit", "grounded-edit", "media"]) {
		assert.match(readText("extensions/grok-build/src/profiles.ts"), new RegExp(`${id}`));
	}
});

test("provider-use confirmation gates prompt-carrying actions", () => {
	assert.match(schemas, /confirm_provider_use/);
	assert.match(service, /provider_use_not_confirmed/);
	assert.match(service, /turn_not_found/);
	assert.match(service, /input\.preview === true/);
	assert.match(service, /Answer artifact/);
	assert.match(service, /Cursor: \$\{record\.event_cursor\}/);
	assert.match(service, /turn_dropped/);
	assert.match(service, /state: "dropped"/);
	assert.match(entry, /confirmProviderUse/);
	assert.match(entry, /ctx\.ui\.confirm/);
});

test("runtime is grok agent stdio without fallback runtimes", () => {
	assert.match(launch, /"--no-auto-update"/);
	assert.match(launch, /"agent", "--no-leader", "stdio"/);
	assert.match(readText("README.md"), /No `grok -p`, raw xAI API path, TUI scraping, relay, or fallback runtime/);
	for (const forbidden of ["grok -p", "raw xAI API calls", "TUI scraping", "relay/WebSocket"]) {
		assert.match(readText("ARCH.md"), new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
	}
});

test("write profiles use package-owned assigned worktrees and changes readback", () => {
	assert.match(changes, /createAssignedWorktree/);
	assert.match(changes, /removeAssignedWorktreePath/);
	assert.match(changes, /git", \["-C", args\.cwd, "worktree", "add"/);
	assert.match(service, /requireCleanParent/);
	assert.match(service, /removeAssignedWorktreePath/);
	assert.match(service, /materializeChanges/);
	assert.doesNotMatch(readText("docs/configuration.md"), /profiles\.\*\.worktree knob is accepted/);
});

test("media inputs require the media profile and use ACP embedded resource blobs", () => {
	assert.match(service, /media_profile_required/);
	assert.match(service, /!profile\.media && input\.input\?\.length/);
	assert.match(service, /!record\.profile\.media && input\.input\?\.length/);
	assert.match(inputArtifacts, /inputResourceBlocks/);
	assert.match(inputArtifacts, /type: "resource"/);
	assert.match(inputArtifacts, /blob: readFileSync\(input\.path\)\.toString\("base64"\)/);
	assert.match(inputArtifacts, /MIN_IMAGE_PIXELS = 512/);
	assert.doesNotMatch(inputArtifacts, /image\/gif/);
	assert.match(readText("extensions/grok-build/src/acp-client.ts"), /embeddedContextSupported/);
	assert.match(readText("extensions/grok-build/src/acp-client.ts"), /embedded_context_unsupported/);
});

test("too-small media inputs are denied during admission before prompt dispatch", () => {
	const tmp = mkdtempSync(join(tmpdir(), "pi-grok-build-small-media-"));
	const oldState = process.env.PI_GROK_BUILD_HOME;
	try {
		process.env.PI_GROK_BUILD_HOME = join(tmp, "state");
		const image = join(tmp, "tiny.png");
		const png = Buffer.alloc(24);
		png[0] = 0x89;
		png.write("PNG", 1, "ascii");
		png.writeUInt32BE(8, 16);
		png.writeUInt32BE(8, 20);
		writeFileSync(image, png);
		assert.throws(
			() => admitAndCopyInputs({ internalId: "s-cccccccccccccccccccccccccccccccc", turnId: "t1", cwd: tmp, input: [{ path: image, kind: "image", purpose: "reference" }] }),
			(error) => error instanceof InputAdmissionError && /minimum supported dimensions/.test(error.message),
		);
	} finally {
		if (oldState === undefined) delete process.env.PI_GROK_BUILD_HOME;
		else process.env.PI_GROK_BUILD_HOME = oldState;
	}
});

test("media outputs are copied into package-owned turn artifacts", () => {
	assert.match(outputArtifacts, /harvestMediaOutputArtifacts/);
	assert.match(readText("extensions/grok-build/src/acp-client.ts"), /harvestMediaOutputArtifacts/);
	assert.match(readText("extensions/grok-build/src/service.ts"), /Media artifacts:/);
	assert.match(entry, /Media artifacts:/);
	assert.match(rendering, /media_artifacts/);
	const tmp = mkdtempSync(join(tmpdir(), "pi-grok-build-media-output-"));
	const oldHome = process.env.HOME;
	const oldState = process.env.PI_GROK_BUILD_HOME;
	try {
		process.env.HOME = tmp;
		process.env.PI_GROK_BUILD_HOME = join(tmp, "state");
		const source = join(tmp, ".grok", "sessions", "session-1", "images", "1.jpg");
		mkdirSync(join(tmp, ".grok", "sessions", "session-1", "images"), { recursive: true });
		writeFileSync(source, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
		const artifacts = harvestMediaOutputArtifacts("s-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "t1", `created ${source}`);
		assert.equal(artifacts.length, 1);
		assert.equal(artifacts[0].kind, "image");
		assert.equal(artifacts[0].mime, "image/jpeg");
		assert.ok(artifacts[0].sha256);
		assert.ok(existsSync(artifacts[0].path));
		assert.match(artifacts[0].path, /turns\/t1\/media\/m1-1\.jpg$/);
	} finally {
		if (oldHome === undefined) delete process.env.HOME;
		else process.env.HOME = oldHome;
		if (oldState === undefined) delete process.env.PI_GROK_BUILD_HOME;
		else process.env.PI_GROK_BUILD_HOME = oldState;
	}
});

test("terminal turn errors are not overwritten by worker close failures", () => {
	const acpClient = readText("extensions/grok-build/src/acp-client.ts");
	assert.match(acpClient, /record\?\.status === "cancelled"/);
	assert.match(acpClient, /record\?\.status === "failed" && record\.error/);
	assert.match(acpClient, /record\.status === "cancelled"/);
	assert.match(acpClient, /record\.status === "failed" && record\.error/);
	assert.match(acpClient, /this\.lastActivityAt = Date\.now\(\)/);
});

test("shutdown and widget attention do not turn stopped history into sticky alerts", () => {
	assert.match(service, /record\.status === "starting" \|\| record\.status === "turn_active" \|\| hasActiveTurn\(record\)/);
	assert.match(service, /controller\.close\(reason\)/);
	assert.match(rendering, /const attention = sessions\.filter\(\(session\) => session\.status === "failed"\)/);
	assert.match(rendering, /session\.status === "cancelled" \? "×"/);
});

test("provider stderr maps to actionable result errors", () => {
	const pixels = providerErrorReceipt("ERROR responses API error status=400 Bad Request error_message=Client specified an invalid argument: Image has 64 total pixels (8x8), which is below the minimum of 512 pixels.");
	assert.equal(pixels?.code, "media_input_dimension_invalid");
	assert.match(pixels?.message ?? "", /minimum of 512 pixels/);
	const format = providerErrorReceipt("API error (status 400 Bad Request): Client specified an invalid argument: Downloaded response does not contain a valid JPG, PNG, or WebP image.");
	assert.equal(format?.code, "media_input_format_invalid");
});

test("runtime TypeScript avoids strip-only unsupported parameter properties", () => {
	const runtimeSource = [entry, readText("extensions/grok-build/src/acp-client.ts"), readText("extensions/grok-build/src/input-artifacts.ts")].join("\n");
	assert.doesNotMatch(runtimeSource, /constructor\([^)]*\b(?:public|private|protected|readonly)\b/);
});

test("fixed widget is used and footer status is absent", () => {
	assert.match(entry, /WIDGET_KEY = "grok-build:fixed"/);
	assert.match(entry, /ctx\.ui\.setWidget\(WIDGET_KEY/);
	assert.match(entry, /Cursor: \$\{details\.session\.event_cursor\}/);
	assert.match(rendering, /class GrokBuildWidget/);
	assert.match(rendering, /cursor/);
	assert.doesNotMatch(entry, /setStatus/);
	assert.doesNotMatch(entry, /setFooter/);
});
