/** Public action dispatcher for the `grok_build` Pi tool. */

import { rmSync } from "node:fs";
import { artifactsDir, sessionDir } from "./paths.ts";
import { AcpSessionController, errorReceipt } from "./acp-client.ts";
import { createAssignedWorktree, materializeChanges, removeAssignedWorktree, removeAssignedWorktreePath } from "./changes.ts";
import { admitCwd, requireCleanParent } from "./cwd-policy.ts";
import { buildLaunchSpec } from "./grok-launch.ts";
import { admitAndCopyInputs, InputAdmissionError } from "./input-artifacts.ts";
import {
	answerText,
	appendEvent,
	attachTurnInputs,
	createSessionRecord,
	deleteSessionArtifacts,
	enqueueTurn,
	findRecordByHandle,
	hasActiveTurn,
	isTerminal,
	listRecords,
	makeInternalSessionId,
	makePublicHandle,
	materialEventsAfter,
	readRecord,
	selectedTurn,
	updateSession,
	updateTurn,
} from "./ledger.ts";
import { resolveProfile } from "./profiles.ts";
import type { ChangesInput, CleanupInput, ErrorReceipt, GrokBuildDetails, GrokBuildInput, ResultInput, SendInput, SessionRecord, StartInput, StatusInput, WorktreeReceipt } from "./types.ts";

const controllers = new Map<string, AcpSessionController>();

export async function runGrokBuild(input: GrokBuildInput, fallbackCwd: string): Promise<{ content: Array<{ type: "text"; text: string }>; details: GrokBuildDetails }> {
	const details = await dispatch(input, fallbackCwd);
	return { content: [{ type: "text", text: formatForModel(details, input) }], details };
}

export function cancelAll(reason: string): void {
	for (const [internalId, controller] of controllers) {
		const record = readRecord(internalId);
		if (record && (record.status === "starting" || record.status === "turn_active" || hasActiveTurn(record))) {
			void controller.cancel(reason);
			continue;
		}
		controller.close(reason);
		controllers.delete(internalId);
	}
}

export function recentSessionDetails(): GrokBuildDetails[] {
	return listRecords().slice(0, 5).map((session) => ({ kind: "pi_grok_build", action: "status", ok: true, session }));
}

async function dispatch(input: GrokBuildInput, fallbackCwd: string): Promise<GrokBuildDetails> {
	if (input.action === "start") return start(input, fallbackCwd);
	if (input.action === "send") return send(input);
	if (input.action === "status") return status(input);
	if (input.action === "result") return result(input);
	if (input.action === "changes") return changes(input);
	if (input.action === "cancel") return cancel(input);
	if (input.action === "cleanup") return cleanup(input);
	return fail("status", "action_unknown", "Unknown grok_build action.");
}

async function start(input: StartInput, fallbackCwd: string): Promise<GrokBuildDetails> {
	if (input.confirm_provider_use !== true) return fail("start", "provider_use_not_confirmed", "start launches prompt-carrying Grok provider work and requires confirm_provider_use:true after explicit authorization.");
	if (!nonEmptyString(input.task)) return fail("start", "task_required", "start requires a non-empty task.");
	const profile = resolveProfile(input.profile);
	const cwd = admitCwd(input.cwd, fallbackCwd);
	if (!cwd.ok) return fail("start", cwd.error.code, cwd.error.message);
	const dirty = profile.write_capable ? requireCleanParent(cwd.cwd.git_root) : null;
	if (dirty) return fail("start", dirty.code, dirty.message);
	if (!profile.media && input.input?.length) return fail("start", "media_profile_required", "Media input attachments require the media profile.");
	const internalId = makeInternalSessionId();
	let worktree: WorktreeReceipt | undefined;
	try {
		worktree = profile.write_capable ? createAssignedWorktree({ internalId, cwd: cwd.cwd.git_root, baseHead: cwd.cwd.head }) : undefined;
		const session = uniqueHandle();
		const launch = buildLaunchSpec({ input, cwd: cwd.cwd.cwd, head: cwd.cwd.head, profile, worktree });
		const record = createSessionRecord({ internal_id: internalId, session, cwd: cwd.cwd.cwd, git_root: cwd.cwd.git_root, profile, launch_spec: launch, first_task: input.task });
		const firstTurn = record.turns[0];
		const inputs = admitAndCopyInputs({ internalId, turnId: firstTurn.id, cwd: cwd.cwd.cwd, input: input.input, extraRoots: [artifactsDir(internalId)] });
		if (inputs.length > 0) attachTurnInputs(internalId, firstTurn.id, inputs);
		const controller = new AcpSessionController(internalId);
		controllers.set(internalId, controller);
		controller.start();
		return ok("start", readRecord(internalId) ?? record, { message: "Grok session started." });
	} catch (error) {
		if (worktree?.path) removeAssignedWorktreePath(cwd.cwd.git_root, worktree.path);
		rmSync(sessionDir(internalId), { recursive: true, force: true });
		return inputOrGenericFailure("start", error);
	}
}

async function send(input: SendInput): Promise<GrokBuildDetails> {
	if (input.confirm_provider_use !== true) return fail("send", "provider_use_not_confirmed", "send adds prompt-carrying Grok provider work and requires confirm_provider_use:true after explicit authorization.");
	if (!nonEmptyString(input.session)) return fail("send", "session_required", "send requires a session handle.");
	if (!nonEmptyString(input.task)) return fail("send", "task_required", "send requires a non-empty task.");
	const record = lookup(input.session, "send");
	if (isFailure(record)) return record;
	if (isTerminal(record.status)) return fail("send", "session_terminal", "This pi-grok-build session is terminal; start a new session.", record);
	if (!record.profile.media && input.input?.length) return fail("send", "media_profile_required", "Media input attachments require a media profile session.", record);
	if (input.interrupt === true && hasActiveTurn(record)) return fail("send", "interrupt_not_supported", "Interrupting an active Grok turn is not yet exposed; cancel the session or send without interrupt to queue a follow-up.", record);
	const queued = enqueueTurn(record.internal_id, input.task);
	if (!queued) return fail("send", "session_not_found", "Unknown pi-grok-build session handle.");
	try {
		const inputs = admitAndCopyInputs({ internalId: record.internal_id, turnId: queued.id, cwd: record.cwd, input: input.input, extraRoots: [artifactsDir(record.internal_id)] });
		if (inputs.length > 0) attachTurnInputs(record.internal_id, queued.id, inputs);
	} catch (error) {
		const receipt = operationErrorReceipt(error);
		updateTurn(record.internal_id, queued.id, { state: "dropped", completed_at: new Date().toISOString(), error: receipt });
		appendEvent(record.internal_id, "turn_dropped", receipt.message, true, queued.id, { code: receipt.code });
		return fail("send", receipt.code, receipt.message, readRecord(record.internal_id) ?? record);
	}
	const controller = controllerFor(record);
	controller.start();
	return ok("send", readRecord(record.internal_id) ?? record, { turn: queued, message: "Follow-up queued." });
}

async function status(input: StatusInput): Promise<GrokBuildDetails> {
	if (!nonEmptyString(input.session)) return fail("status", "session_required", "status requires a session handle.");
	const record = lookup(input.session, "status");
	if (isFailure(record)) return record;
	const waitMs = Math.round((input.wait_seconds ?? 0) * 1000);
	const started = Date.now();
	const cursor = parseCursor(input.cursor, record.event_cursor);
	let outcome: "not_requested" | "completed" | "material" | "terminal" | "timeout" = waitMs > 0 ? "timeout" : "not_requested";
	while (waitMs > 0 && Date.now() - started < waitMs) {
		const latest = readRecord(record.internal_id);
		if (!latest) return fail("status", "session_not_found", "Unknown pi-grok-build session handle.");
		if (materialEventsAfter(record.internal_id, cursor).length > 0) {
			outcome = "material";
			break;
		}
		if (isTerminal(latest.status)) {
			outcome = "terminal";
			break;
		}
		await sleep(100);
	}
	const latest = readRecord(record.internal_id) ?? record;
	return ok("status", latest, { wait: { requested: waitMs > 0, outcome, elapsed_ms: Date.now() - started } });
}

async function result(input: ResultInput): Promise<GrokBuildDetails> {
	if (!nonEmptyString(input.session)) return fail("result", "session_required", "result requires a session handle.");
	const record = lookup(input.session, "result");
	if (isFailure(record)) return record;
	if (input.turn && input.turn !== "latest" && !record.turns.some((turn) => turn.id === input.turn)) return fail("result", "turn_not_found", `Unknown turn ${input.turn} for session ${input.session}.`, record);
	const waitMs = Math.round((input.wait_seconds ?? 0) * 1000);
	const started = Date.now();
	let latest: SessionRecord = record;
	while (Date.now() - started <= waitMs) {
		latest = readRecord(record.internal_id) ?? latest;
		const turn = selectedTurn(latest, input.turn);
		if (turn?.state === "completed") return ok("result", latest, { turn, wait: { requested: waitMs > 0, outcome: "completed", elapsed_ms: Date.now() - started } });
		if (turn && ["failed", "cancelled", "dropped"].includes(turn.state)) return ok("result", latest, { turn, wait: { requested: waitMs > 0, outcome: "terminal", elapsed_ms: Date.now() - started } });
		if (isTerminal(latest.status)) return ok("result", latest, { turn, wait: { requested: waitMs > 0, outcome: "terminal", elapsed_ms: Date.now() - started } });
		if (waitMs === 0) break;
		await sleep(100);
	}
	latest = readRecord(record.internal_id) ?? latest;
	return ok("result", latest, { turn: selectedTurn(latest, input.turn), wait: { requested: waitMs > 0, outcome: waitMs > 0 ? "timeout" : "not_requested", elapsed_ms: Date.now() - started } });
}

function changes(input: ChangesInput): GrokBuildDetails {
	if (!nonEmptyString(input.session)) return fail("changes", "session_required", "changes requires a session handle.");
	const record = lookup(input.session, "changes");
	if (isFailure(record)) return record;
	if (hasActiveTurn(record)) return fail("changes", "changes_unavailable_active", "changes is denied while a turn is active.", record);
	if (!record.profile.write_capable) return fail("changes", "changes_unavailable", "changes is available only for worktree-edit and grounded-edit sessions.", record);
	const summary = materializeChanges(record, input.preview === true);
	appendEvent(record.internal_id, "changes_materialized", "Materialized assigned worktree changes.", true, undefined, { change_status: summary.change_status });
	return ok("changes", readRecord(record.internal_id) ?? record, { changes: summary });
}

async function cancel(input: { action: "cancel"; session: string; reason?: string }): Promise<GrokBuildDetails> {
	if (!nonEmptyString(input.session)) return fail("cancel", "session_required", "cancel requires a session handle.");
	const record = lookup(input.session, "cancel");
	if (isFailure(record)) return record;
	const reason = input.reason ?? "Cancelled by pi-grok-build caller.";
	const controller = controllers.get(record.internal_id);
	if (controller) await controller.cancel(reason);
	else {
		updateSession(record.internal_id, { status: "cancelled", active_turn_id: undefined, error: { code: "cancelled", message: reason } });
		appendEvent(record.internal_id, "session_cancelled", reason, true);
	}
	return ok("cancel", readRecord(record.internal_id) ?? record, { message: reason });
}

function cleanup(input: CleanupInput): GrokBuildDetails {
	if (!nonEmptyString(input.session)) return fail("cleanup", "session_required", "cleanup requires a session handle.");
	const record = lookup(input.session, "cleanup");
	if (isFailure(record)) return record;
	if (hasActiveTurn(record)) return fail("cleanup", "cleanup_session_active", "cleanup is denied while a turn is active; cancel first.", record);
	controllers.get(record.internal_id)?.close("cleanup");
	controllers.delete(record.internal_id);
	const worktreePaths = removeAssignedWorktree(record);
	const deleted = [...worktreePaths, ...deleteSessionArtifacts(record.internal_id)];
	return { kind: "pi_grok_build", action: "cleanup", ok: true, cleanup: { session: input.session, deleted_paths: deleted }, message: "Deleted pi-grok-build retained evidence for the requested session." };
}

function controllerFor(record: SessionRecord): AcpSessionController {
	let controller = controllers.get(record.internal_id);
	if (!controller) {
		controller = new AcpSessionController(record.internal_id);
		controllers.set(record.internal_id, controller);
	}
	return controller;
}

function lookup(session: string, action: GrokBuildDetails["action"]): SessionRecord | GrokBuildDetails {
	const record = findRecordByHandle(session);
	return record ?? fail(action, "session_not_found", "Unknown pi-grok-build session handle.");
}

function isFailure(value: SessionRecord | GrokBuildDetails): value is GrokBuildDetails {
	return "kind" in value && value.kind === "pi_grok_build";
}

function nonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function ok(action: GrokBuildDetails["action"], session: SessionRecord, extras: Partial<GrokBuildDetails> = {}): GrokBuildDetails {
	return { kind: "pi_grok_build", action, ok: true, session, ...extras };
}

function fail(action: GrokBuildDetails["action"], code: string, message: string, session?: SessionRecord): GrokBuildDetails {
	return { kind: "pi_grok_build", action, ok: false, session, error: { code, message } };
}

function inputOrGenericFailure(action: GrokBuildDetails["action"], error: unknown): GrokBuildDetails {
	const receipt = operationErrorReceipt(error);
	return fail(action, receipt.code, receipt.message);
}

function operationErrorReceipt(error: unknown): ErrorReceipt {
	if (error instanceof InputAdmissionError) return { code: "input_admission_failed", message: error.message };
	return errorReceipt(error, "operation_failed");
}

function uniqueHandle(): string {
	for (let i = 0; i < 1000; i += 1) {
		const handle = makePublicHandle();
		if (!findRecordByHandle(handle)) return handle;
	}
	throw new Error("could not allocate pi-grok-build session handle");
}

function parseCursor(cursor: string | undefined, defaultCursor: number): number {
	if (!cursor) return defaultCursor;
	const parsed = Number(cursor);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultCursor;
}

function formatForModel(details: GrokBuildDetails, input: GrokBuildInput): string {
	if (!details.ok) return [`# grok_build ${details.action}`, "", `Error: ${details.error?.code ?? "error"} - ${details.error?.message ?? "unknown"}`].join("\n");
	if (details.action === "cleanup") return [`# grok_build cleanup`, "", `Deleted paths: ${details.cleanup?.deleted_paths.length ?? 0}`].join("\n");
	const record = details.session;
	if (!record) return `# grok_build ${details.action}\n\nOK`;
	const turn = details.turn ?? selectedTurn(record);
	const lines = [`# grok_build ${details.action}`, "", `Session: ${record.session}`, `State: ${record.status}`, `Profile: ${record.profile.id}`, `Cursor: ${record.event_cursor}`];
	if (details.wait) lines.push(`Wait: ${details.wait.outcome} in ${details.wait.elapsed_ms}ms`);
	if (turn) lines.push(`Turn: ${turn.id} ${turn.state}`);
	if (details.action === "result") {
		const showPreview = input.action === "result" && input.preview === true;
		const text = answerText(turn ?? null, showPreview);
		if (text) lines.push("", "## Answer preview", text);
		else if (turn?.error) lines.push("", `Turn error: ${turn.error.code} - ${turn.error.message}`);
		else if (record.error) lines.push("", `Session error: ${record.error.code} - ${record.error.message}`);
		else if (turn?.answer_path) lines.push("", `Answer artifact: ${turn.answer_path}`);
		else lines.push("", "Result is not ready.");
		if (turn?.media_artifacts?.length) lines.push("", "Media artifacts:", ...turn.media_artifacts.map((artifact) => `${artifact.id} ${artifact.kind} ${artifact.path}`));
	}
	if (details.changes) lines.push("", `Changes: ${details.changes.change_status}`, `Files: ${details.changes.files.map((file) => file.path).join(", ") || "none"}`, `Diff artifact: ${details.changes.artifacts.diff ?? "none"}`);
	lines.push("", `Artifact root: ${artifactsDir(record.internal_id)}`);
	return lines.join("\n");
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
