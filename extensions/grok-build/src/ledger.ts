/** Durable session ledger for Pi Grok Build. */

import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { artifactsDir, ensureState, eventsPath, recordPath, sessionDir, sessionsRoot, turnDir } from "./paths.ts";
import type { ErrorReceipt, InputArtifact, LaunchSpec, MediaOutputArtifact, ProfileDefinition, SessionEvent, SessionRecord, SessionStatus, TurnRecord } from "./types.ts";

export function makeInternalSessionId(): string {
	return `s-${randomBytes(16).toString("hex")}`;
}

let handleCounter = 0;
export function makePublicHandle(): string {
	handleCounter = (handleCounter + 1) % 10_000_000;
	return `g${handleCounter || 1}`;
}

export function createSessionRecord(args: {
	internal_id: string;
	session: string;
	cwd: string;
	git_root: string;
	profile: ProfileDefinition;
	launch_spec: LaunchSpec;
	first_task: string;
}): SessionRecord {
	const now = new Date().toISOString();
	const record: SessionRecord = {
		kind: "pi_grok_build_session",
		internal_id: args.internal_id,
		session: args.session,
		status: "starting",
		created_at: now,
		updated_at: now,
		cwd: args.cwd,
		git_root: args.git_root,
		profile: args.profile,
		launch_spec: args.launch_spec,
		turns: [newTurn(1, args.first_task)],
		event_cursor: 0,
	};
	writeRecord(record);
	appendEvent(record.internal_id, "session_created", "Session record created.", true, undefined, { profile: args.profile.id });
	return record;
}

export function newTurn(index: number, task: string): TurnRecord {
	return {
		id: `t${index}`,
		index,
		task,
		state: "queued",
		created_at: new Date().toISOString(),
	};
}

export function enqueueTurn(internalId: string, task: string, inputArtifacts?: InputArtifact[]): TurnRecord | null {
	const record = readRecord(internalId);
	if (!record) return null;
	const turn = newTurn(record.turns.length + 1, task);
	if (inputArtifacts?.length) turn.input_artifacts = inputArtifacts;
	record.turns.push(turn);
	record.updated_at = new Date().toISOString();
	writeRecord(record);
	appendEvent(internalId, "turn_queued", `Queued ${turn.id}.`, true, turn.id);
	return turn;
}

export function attachTurnInputs(internalId: string, turnId: string, inputArtifacts: InputArtifact[]): void {
	const record = mustReadRecord(internalId);
	const turn = record.turns.find((entry) => entry.id === turnId);
	if (!turn) throw new Error(`unknown turn ${turnId}`);
	turn.input_artifacts = inputArtifacts;
	record.updated_at = new Date().toISOString();
	writeRecord(record);
}

export function updateSession(internalId: string, patch: Partial<Pick<SessionRecord, "status" | "active_turn_id" | "error" | "pid">>): SessionRecord | null {
	const record = readRecord(internalId);
	if (!record) return null;
	if (patch.status !== undefined) record.status = patch.status;
	if ("active_turn_id" in patch) record.active_turn_id = patch.active_turn_id;
	if ("error" in patch) record.error = patch.error;
	if ("pid" in patch) record.pid = patch.pid;
	record.updated_at = new Date().toISOString();
	writeRecord(record);
	return record;
}

export function updateTurn(internalId: string, turnId: string, patch: Partial<TurnRecord>): SessionRecord | null {
	const record = readRecord(internalId);
	if (!record) return null;
	const turn = record.turns.find((entry) => entry.id === turnId);
	if (!turn) return null;
	Object.assign(turn, patch);
	record.updated_at = new Date().toISOString();
	writeRecord(record);
	return record;
}

export function failSession(internalId: string, error: ErrorReceipt, turnId?: string): SessionRecord | null {
	if (turnId) updateTurn(internalId, turnId, { state: "failed", completed_at: new Date().toISOString(), error });
	const record = updateSession(internalId, { status: "failed", active_turn_id: undefined, error });
	appendEvent(internalId, "session_failed", error.message, true, turnId, { code: error.code });
	return record;
}

export function completeTurn(internalId: string, turnId: string, answer: string, answerPath: string, mediaArtifacts: MediaOutputArtifact[] = []): SessionRecord | null {
	mkdirSync(dirname(answerPath), { recursive: true });
	writeFileSync(answerPath, answer, "utf8");
	const record = updateTurn(internalId, turnId, {
		state: "completed",
		completed_at: new Date().toISOString(),
		answer_path: answerPath,
		answer_chars: Array.from(answer).length,
		media_artifacts: mediaArtifacts.length > 0 ? mediaArtifacts : undefined,
	});
	updateSession(internalId, { status: "idle", active_turn_id: undefined });
	appendEvent(internalId, "turn_completed", `Completed ${turnId}.`, true, turnId, { answer_path: answerPath, media_artifacts: mediaArtifacts.length });
	return record;
}

export function writeRecord(record: SessionRecord): void {
	ensureState();
	mkdirSync(sessionDir(record.internal_id), { recursive: true, mode: 0o700 });
	writeFileSync(recordPath(record.internal_id), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

export function readRecord(internalId: string): SessionRecord | null {
	const path = recordPath(internalId);
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, "utf8")) as SessionRecord;
}

export function mustReadRecord(internalId: string): SessionRecord {
	const record = readRecord(internalId);
	if (!record) throw new Error(`missing pi-grok-build session ${internalId}`);
	return record;
}

export function findRecordByHandle(handle: string): SessionRecord | null {
	ensureState();
	if (!existsSync(sessionsRoot())) return null;
	for (const name of readdirSync(sessionsRoot())) {
		if (!/^s-[a-f0-9]{32}$/.test(name)) continue;
		const record = readRecord(name);
		if (record?.session === handle) return record;
	}
	return null;
}

export function listRecords(): SessionRecord[] {
	ensureState();
	if (!existsSync(sessionsRoot())) return [];
	return readdirSync(sessionsRoot())
		.filter((name) => /^s-[a-f0-9]{32}$/.test(name))
		.map((name) => readRecord(name))
		.filter((record): record is SessionRecord => record !== null)
		.sort((left, right) => right.updated_at.localeCompare(left.updated_at));
}

export function appendEvent(internalId: string, type: string, message: string, material: boolean, turn?: string, data?: Record<string, unknown>): SessionEvent {
	const record = mustReadRecord(internalId);
	const event: SessionEvent = {
		seq: record.event_cursor + 1,
		at: new Date().toISOString(),
		type,
		turn,
		message,
		data,
		material,
	};
	record.event_cursor = event.seq;
	record.updated_at = event.at;
	writeRecord(record);
	writeFileSync(eventsPath(internalId), `${JSON.stringify(event)}\n`, { encoding: "utf8", flag: "a" });
	return event;
}

export function readEvents(internalId: string): SessionEvent[] {
	const path = eventsPath(internalId);
	if (!existsSync(path)) return [];
	return readFileSync(path, "utf8")
		.split(/\r?\n/)
		.filter((line) => line.trim().length > 0)
		.map((line) => JSON.parse(line) as SessionEvent);
}

export function materialEventsAfter(internalId: string, cursor: number): SessionEvent[] {
	return readEvents(internalId).filter((event) => event.material && event.seq > cursor);
}

export function latestCompletedTurn(record: SessionRecord): TurnRecord | null {
	return [...record.turns].reverse().find((turn) => turn.state === "completed") ?? null;
}

export function selectedTurn(record: SessionRecord, selector?: string): TurnRecord | null {
	if (!selector || selector === "latest") return latestCompletedTurn(record) ?? [...record.turns].reverse()[0] ?? null;
	return record.turns.find((turn) => turn.id === selector) ?? null;
}

export function nextQueuedTurn(record: SessionRecord): TurnRecord | null {
	return record.turns.find((turn) => turn.state === "queued") ?? null;
}

export function hasActiveTurn(record: SessionRecord): boolean {
	return record.turns.some((turn) => turn.state === "sent" || turn.state === "streaming");
}

export function isTerminal(status: SessionStatus): boolean {
	return status === "failed" || status === "cancelled" || status === "cleaned";
}

export function answerText(turn: TurnRecord | null, preview: boolean): string | null {
	if (!turn?.answer_path || !existsSync(turn.answer_path)) return null;
	const text = readFileSync(turn.answer_path, "utf8");
	if (!preview) return null;
	const chars = Array.from(text);
	return chars.length > 2000 ? `${chars.slice(0, 2000).join("")}\n[preview truncated; full answer in artifact]` : text;
}

export function deleteSessionArtifacts(internalId: string): string[] {
	const paths = [artifactsDir(internalId), eventsPath(internalId), recordPath(internalId), sessionDir(internalId)];
	const deleted: string[] = [];
	for (const path of paths) {
		if (!existsSync(path)) continue;
		rmSync(path, { recursive: true, force: true });
		deleted.push(path);
	}
	return deleted;
}

export function ensureTurnDir(internalId: string, turnId: string): string {
	const path = turnDir(internalId, turnId);
	mkdirSync(path, { recursive: true, mode: 0o700 });
	return path;
}
