/** State and artifact paths for Pi Grok Build. */

import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export function stateRoot(): string {
	const explicit = process.env.PI_GROK_BUILD_HOME?.trim();
	if (explicit) return resolve(explicit);
	const piAgentDir = process.env.PI_CODING_AGENT_DIR?.trim();
	if (piAgentDir) return resolve(piAgentDir, "pi-grok-build");
	return resolve(homedir(), ".pi", "agent", "pi-grok-build");
}

export function sessionsRoot(): string {
	return join(stateRoot(), "sessions");
}

export function ensureState(): void {
	mkdirSync(sessionsRoot(), { recursive: true, mode: 0o700 });
}

export function sessionDir(internalId: string): string {
	if (!/^s-[a-f0-9]{32}$/.test(internalId)) throw new Error("unsafe pi-grok-build internal session id");
	return join(sessionsRoot(), internalId);
}

export function artifactsDir(internalId: string): string {
	return join(sessionDir(internalId), "artifacts");
}

export function turnDir(internalId: string, turnId: string): string {
	if (!/^t[1-9][0-9]*$/.test(turnId)) throw new Error("unsafe pi-grok-build turn id");
	return join(artifactsDir(internalId), "turns", turnId);
}

export function inputDir(internalId: string, turnId: string): string {
	return join(turnDir(internalId, turnId), "inputs");
}

export function mediaDir(internalId: string, turnId: string): string {
	return join(turnDir(internalId, turnId), "media");
}

export function answerPath(internalId: string, turnId: string): string {
	return join(turnDir(internalId, turnId), "answer.md");
}

export function eventsPath(internalId: string): string {
	return join(sessionDir(internalId), "events.jsonl");
}

export function recordPath(internalId: string): string {
	return join(sessionDir(internalId), "session.json");
}

export function changesSummaryPath(internalId: string): string {
	return join(artifactsDir(internalId), "changes.json");
}

export function changesDiffPath(internalId: string): string {
	return join(artifactsDir(internalId), "changes.diff");
}

export function assignedWorktreePath(internalId: string): string {
	return join(artifactsDir(internalId), "execution-worktree");
}
