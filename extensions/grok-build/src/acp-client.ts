/** Minimal ACP supervisor for `grok agent stdio`. */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface, type Interface } from "node:readline";
import { answerPath } from "./paths.ts";
import { harvestMediaOutputArtifacts } from "./output-artifacts.ts";
import {
	appendEvent,
	completeTurn,
	failSession,
	hasActiveTurn,
	mustReadRecord,
	nextQueuedTurn,
	readRecord,
	updateSession,
	updateTurn,
} from "./ledger.ts";
import { inputPromptSection, inputResourceBlocks, mediaInputDimensionError } from "./input-artifacts.ts";
import type { AcpResourceBlock, ErrorReceipt, SessionRecord, TurnRecord } from "./types.ts";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type TextBlock = { type: "text"; text: string };
type PromptBlock = TextBlock | AcpResourceBlock;

interface PendingRequest {
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
}

export class AcpSessionController {
	readonly internalId: string;
	private process: ChildProcessWithoutNullStreams | undefined;
	private reader: Interface | undefined;
	private pending = new Map<number, PendingRequest>();
	private nextRequestId = 1;
	private backendSessionId: string | undefined;
	private activeTurnId: string | undefined;
	private answerBuffer = "";
	private running = false;
	private cancelled = false;
	private embeddedContextSupported = false;
	private gitHeadChanged: Record<string, unknown> | undefined;
	private lastActivityAt = Date.now();
	private workerFailureRecorded = false;
	private recentStderr = "";

	constructor(internalId: string) {
		this.internalId = internalId;
	}

	start(): void {
		if (this.running) return;
		this.running = true;
		void this.run()
			.catch((error: unknown) => {
				const record = readRecord(this.internalId);
				if (this.cancelled || record?.status === "cancelled") return;
				if (record?.status === "failed" && record.error) {
					this.close(record.error.code);
					return;
				}
				const receipt = this.publicErrorReceipt(error, "worker_failed");
				failSession(this.internalId, receipt, this.activeTurnId);
				this.close(receipt.code);
			})
			.finally(() => {
				this.running = false;
			});
	}

	async cancel(reason: string): Promise<void> {
		this.cancelled = true;
		const record = readRecord(this.internalId);
		if (this.backendSessionId && hasActiveTurn(record ?? mustReadRecord(this.internalId))) {
			await this.request("session/cancel", { sessionId: this.backendSessionId }, 10000).catch(() => undefined);
		}
		if (this.activeTurnId) updateTurn(this.internalId, this.activeTurnId, { state: "cancelled", completed_at: new Date().toISOString(), error: { code: "cancelled", message: reason } });
		updateSession(this.internalId, { status: "cancelled", active_turn_id: undefined, error: { code: "cancelled", message: reason } });
		appendEvent(this.internalId, "session_cancelled", reason, true, this.activeTurnId);
		this.close("cancelled");
	}

	close(reason: string): void {
		for (const [id, pending] of this.pending) {
			clearTimeout(pending.timer);
			pending.reject(new Error(`ACP session closed before request ${id} completed: ${reason}`));
		}
		this.pending.clear();
		this.reader?.close();
		this.process?.kill("SIGTERM");
		this.reader = undefined;
		this.process = undefined;
	}

	private async run(): Promise<void> {
		if (!this.backendSessionId) await this.open();
		while (!this.cancelled) {
			const record = mustReadRecord(this.internalId);
			const turn = nextQueuedTurn(record);
			if (!turn) {
				updateSession(this.internalId, { status: "idle", active_turn_id: undefined });
				return;
			}
			await this.runTurn(turn);
		}
	}

	private async open(): Promise<void> {
		const record = mustReadRecord(this.internalId);
		this.process = spawn(record.launch_spec.command, record.launch_spec.args, {
			cwd: record.launch_spec.execution_cwd,
			env: { ...process.env, GROK_SUBAGENTS: record.profile.subagents === "enabled" ? "1" : "0", GROK_WEB_SEARCH: record.profile.web_search },
			stdio: "pipe",
		});
		updateSession(this.internalId, { pid: this.process.pid });
		appendEvent(this.internalId, "worker_spawned", "Spawned grok agent stdio worker.", true, undefined, { pid_observed: Boolean(this.process.pid) });
		this.process.on("error", (error) => this.recordWorkerFailure(error));
		this.process.stdin.on("error", (error) => this.recordWorkerFailure(error));
		this.reader = createInterface({ input: this.process.stdout });
		this.reader.on("line", (line) => this.onLine(line));
		this.process.stderr.on("data", (chunk) => {
			const text = String(chunk);
			this.recentStderr = tailText(`${this.recentStderr}\n${stripAnsi(text)}`, 8000);
			if (readRecord(this.internalId)) appendEvent(this.internalId, "grok_stderr", text, false);
		});
		this.process.on("exit", (code, signal) => {
			if (readRecord(this.internalId)) appendEvent(this.internalId, "worker_exit", "Grok worker exited.", true, undefined, { code: code ?? null, signal: signal ?? null });
		});

		const init = await this.request("initialize", {
			protocolVersion: 1,
			clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false },
			clientInfo: { name: "pi-grok-build", title: "Pi Grok Build", version: "0.0.4" },
		}, 60000);
		this.embeddedContextSupported = hasTrueKey(init, "embeddedContext");
		const methodId = pickAuthMethod(init);
		if (!methodId) throw new Error("auth_unavailable: Grok ACP did not advertise cached_token auth; run grok login before using pi-grok-build.");
		await this.request("authenticate", { methodId, _meta: { headless: true, supervisor: "pi-grok-build" } }, 60000);
		const session = await this.request("session/new", { cwd: record.launch_spec.execution_cwd, mcpServers: [] }, 60000);
		const sessionId = stringPath(session, ["sessionId"]);
		if (!sessionId) throw new Error("protocol_failure: session/new did not return sessionId.");
		this.backendSessionId = sessionId;
		await this.assertAssignedWorktreeApplied(record, sessionId);
		appendEvent(this.internalId, "backend_session_started", "Grok ACP backend session started.", true, undefined, { session_id_observed: true });
	}

	private async runTurn(turn: TurnRecord): Promise<void> {
		const record = mustReadRecord(this.internalId);
		if (!this.backendSessionId) throw new Error("protocol_failure: ACP backend session is not open.");
		const dimensionFailure = mediaInputDimensionError(turn.input_artifacts);
		if (dimensionFailure) {
			failSession(this.internalId, dimensionFailure, turn.id);
			throw new Error(dimensionFailure.message);
		}
		if (turn.input_artifacts?.length && !this.embeddedContextSupported) {
			const failure = { code: "embedded_context_unsupported", message: "embedded_context_unsupported: Grok ACP initialize did not advertise embeddedContext; local media input was not sent." };
			failSession(this.internalId, failure, turn.id);
			throw new Error(failure.message);
		}
		this.activeTurnId = turn.id;
		this.answerBuffer = "";
		this.lastActivityAt = Date.now();
		updateSession(this.internalId, { status: "turn_active", active_turn_id: turn.id });
		updateTurn(this.internalId, turn.id, { state: "sent", sent_at: new Date().toISOString() });
		appendEvent(this.internalId, "turn_sent", `Sent ${turn.id}.`, true, turn.id);
		const promptText = `${inputPromptSection(turn.input_artifacts)}${turn.index === 1 ? record.launch_spec.prompt_text : turn.task}`;
		const prompt: PromptBlock[] = [{ type: "text", text: promptText }, ...inputResourceBlocks(turn.input_artifacts)];
		const promptPromise = this.request("session/prompt", { sessionId: this.backendSessionId, prompt }, 30 * 60 * 1000);
		const timeoutMs = record.profile.turn_activity_timeout_ms;
		while (true) {
			const outcome = await Promise.race([
				promptPromise.then((value) => ({ done: true, value }), (error: unknown) => ({ done: true, error })),
				sleep(100).then(() => ({ done: false })),
			]);
			if (outcome.done) {
				if ("error" in outcome) throw outcome.error;
				break;
			}
			if (Date.now() - this.lastActivityAt > timeoutMs) {
				const failure = { code: "backend_no_byte_timeout", message: "Grok ACP backend produced no activity before the configured supervisor timeout." };
				failSession(this.internalId, failure, turn.id);
				throw new Error(failure.message);
			}
		}
		const answer = this.answerBuffer.trim();
		const mediaArtifacts = harvestMediaOutputArtifacts(this.internalId, turn.id, answer);
		completeTurn(this.internalId, turn.id, answer, answerPath(this.internalId, turn.id), mediaArtifacts);
	}

	private request(method: string, params: Record<string, JsonValue> | Record<string, unknown>, timeoutMs: number): Promise<unknown> {
		if (!this.process) return Promise.reject(new Error("ACP worker is not running."));
		const id = this.nextRequestId++;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`${method} timed out`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timer });
			this.process?.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
		});
	}

	private recordWorkerFailure(error: unknown): void {
		const record = readRecord(this.internalId);
		if (this.workerFailureRecorded || !record) return;
		if (this.cancelled || record.status === "cancelled") return;
		if (record.status === "failed" && record.error) return;
		this.workerFailureRecorded = true;
		const receipt = this.publicErrorReceipt(error, "worker_io_failed");
		failSession(this.internalId, receipt, this.activeTurnId);
		this.close(receipt.code);
	}

	private publicErrorReceipt(error: unknown, fallbackCode: string): ErrorReceipt {
		const receipt = errorReceipt(error, fallbackCode);
		const stderrReceipt = providerErrorReceipt(this.recentStderr);
		if (stderrReceipt && (receipt.message === "Internal error" || receipt.code === fallbackCode || receipt.code === "worker_failed")) return stderrReceipt;
		return receipt;
	}

	private onLine(line: string): void {
		this.lastActivityAt = Date.now();
		const message = parseJsonObject(line);
		if (!message) {
			failSession(this.internalId, { code: "protocol_failure", message: "Grok ACP emitted malformed JSON." }, this.activeTurnId);
			return;
		}
		const id = numberProperty(message, "id");
		if (id !== undefined && this.pending.has(id)) {
			const pending = this.pending.get(id);
			if (!pending) return;
			this.pending.delete(id);
			clearTimeout(pending.timer);
			const error = recordProperty(message, "error");
			if (error) pending.reject(new Error(stringProperty(error, "message") ?? JSON.stringify(error)));
			else pending.resolve(message.result ?? {});
			return;
		}
		if (message.method === "session/update") {
			this.onSessionUpdate(recordProperty(recordProperty(message, "params"), "update") ?? recordProperty(message, "params") ?? message);
			return;
		}
		if (message.method === "_x.ai/git_head_changed") {
			this.gitHeadChanged = recordProperty(message, "params") ?? {};
			appendEvent(this.internalId, "grok_git_head_changed", "Grok reported git head/worktree state.", false, this.activeTurnId, compactGitNotice(this.gitHeadChanged));
		}
	}

	private onSessionUpdate(update: Record<string, unknown>): void {
		this.lastActivityAt = Date.now();
		const updateKind = stringProperty(update, "sessionUpdate") ?? stringProperty(update, "type") ?? stringProperty(update, "kind") ?? "session_update";
		const content = recordProperty(update, "content");
		if (updateKind === "agent_message_chunk" && content) {
			const text = stringProperty(content, "text");
			if (text) {
				this.answerBuffer += text;
				if (this.activeTurnId) updateTurn(this.internalId, this.activeTurnId, { state: "streaming" });
				appendEvent(this.internalId, "message_delta", text.slice(0, 240), false, this.activeTurnId);
			}
			return;
		}
		appendEvent(this.internalId, "session_update", updateKind, false, this.activeTurnId);
	}

	private async assertAssignedWorktreeApplied(record: SessionRecord, sessionId: string): Promise<void> {
		if (record.launch_spec.worktree.mode !== "assigned") return;
		await sleep(300);
		const assigned = record.launch_spec.worktree.path;
		const noticeSessionId = typeof this.gitHeadChanged?.sessionId === "string" ? this.gitHeadChanged.sessionId : null;
		const noticeBound = noticeSessionId === null || noticeSessionId === sessionId;
		const noticeSaysParent = this.gitHeadChanged?.isWorktree === false;
		const noticeSaysWorktree = this.gitHeadChanged?.isWorktree === true;
		if (!assigned || record.launch_spec.execution_cwd !== assigned || noticeSaysParent || (this.gitHeadChanged && (!noticeSaysWorktree || !noticeBound))) {
			const failure = { code: "assigned_worktree_not_applied", message: "Assigned pi-grok-build worktree proof failed before prompt dispatch." };
			appendEvent(this.internalId, "proof_event", failure.message, true, undefined, { subtype: "assigned_worktree_not_applied", prompt_sent: false, git_notification_observed: Boolean(this.gitHeadChanged) });
			throw new Error(failure.message);
		}
		appendEvent(this.internalId, "proof_event", "Assigned worktree accepted before prompt dispatch.", true, undefined, { subtype: "assigned_worktree_applied", git_notification_observed: Boolean(this.gitHeadChanged), worktree_path: assigned });
	}
}

export function errorReceipt(error: unknown, fallbackCode: string): ErrorReceipt {
	const message = error instanceof Error ? error.message : String(error);
	const prefix = message.match(/^([a-z0-9_]+):/i)?.[1];
	return { code: prefix ?? fallbackCode, message };
}

export function providerErrorReceipt(stderr: string): ErrorReceipt | null {
	const text = stripAnsi(stderr);
	const apiMessage = apiErrorMessage(text);
	if (!apiMessage) return null;
	if (/minimum of 512 pixels/i.test(apiMessage) || /total pixels/i.test(apiMessage)) return { code: "media_input_dimension_invalid", message: `Grok provider rejected media input: ${apiMessage}` };
	if (/valid JPG, PNG, or WebP image/i.test(apiMessage)) return { code: "media_input_format_invalid", message: `Grok provider rejected media input: ${apiMessage}` };
	return { code: "provider_request_invalid", message: `Grok provider rejected the request: ${apiMessage}` };
}

function apiErrorMessage(text: string): string | null {
	const direct = text.match(/error_message\s*=\s*([^\n]+)/i)?.[1]?.trim();
	if (direct) return direct;
	const api = text.match(/API error \(status [^)]+\):\s*([^\n"]+)/i)?.[1]?.trim();
	return api || null;
}

function stripAnsi(text: string): string {
	return text.replace(/\u001b\[[0-9;]*m/g, "");
}

function tailText(text: string, maxChars: number): string {
	const chars = Array.from(text);
	return chars.length > maxChars ? chars.slice(chars.length - maxChars).join("") : text;
}

function pickAuthMethod(init: unknown): string | null {
	const methods = arrayPath(init, ["authMethods"]);
	for (const method of methods) {
		if (!isRecord(method)) continue;
		const id = stringProperty(method, "id");
		if (id === "cached_token") return id;
	}
	return null;
}

function hasTrueKey(value: unknown, key: string): boolean {
	if (Array.isArray(value)) return value.some((item) => hasTrueKey(item, key));
	if (!isRecord(value)) return false;
	if (value[key] === true) return true;
	return Object.values(value).some((item) => hasTrueKey(item, key));
}

function parseJsonObject(line: string): Record<string, unknown> | null {
	try {
		const parsed = JSON.parse(line) as unknown;
		return isRecord(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordProperty(value: unknown, key: string): Record<string, unknown> | undefined {
	if (!isRecord(value)) return undefined;
	const child = value[key];
	return isRecord(child) ? child : undefined;
}

function stringProperty(value: unknown, key: string): string | undefined {
	if (!isRecord(value)) return undefined;
	const child = value[key];
	return typeof child === "string" ? child : undefined;
}

function numberProperty(value: unknown, key: string): number | undefined {
	if (!isRecord(value)) return undefined;
	const child = value[key];
	return typeof child === "number" ? child : undefined;
}

function stringPath(value: unknown, path: string[]): string | undefined {
	let current = value;
	for (const part of path.slice(0, -1)) current = recordProperty(current, part);
	return stringProperty(current, path[path.length - 1]);
}

function arrayPath(value: unknown, path: string[]): unknown[] {
	let current = value;
	for (const part of path) {
		if (!isRecord(current)) return [];
		current = current[part];
	}
	return Array.isArray(current) ? current : [];
}

function compactGitNotice(notice: Record<string, unknown>): Record<string, unknown> {
	return {
		is_worktree: typeof notice.isWorktree === "boolean" ? notice.isWorktree : null,
		branch: typeof notice.branch === "string" ? notice.branch : null,
		main_repo_observed: typeof notice.mainRepo === "string",
	};
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
