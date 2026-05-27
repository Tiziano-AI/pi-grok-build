/** Cwd and parent repository admission for Pi Grok Build sessions. */

import { existsSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import type { AdmittedCwd, ErrorReceipt } from "./types.ts";

export type AdmitCwdResult = { ok: true; cwd: AdmittedCwd } | { ok: false; error: ErrorReceipt };

export function admitCwd(input: string | undefined, fallback: string): AdmitCwdResult {
	const candidate = resolve(input ?? fallback);
	if (!isAbsolute(candidate)) return failure("cwd_not_absolute", "cwd must resolve to an absolute local path.");
	if (!existsSync(candidate)) return failure("cwd_missing", "cwd does not exist.");
	const real = realpathSync(candidate);
	if (!statSync(real).isDirectory()) return failure("cwd_not_directory", "cwd must resolve to a directory.");
	const root = git(real, ["rev-parse", "--show-toplevel"]);
	if (!root.ok) return failure("cwd_not_git_repo", "cwd must be inside a git repository.");
	const head = git(real, ["rev-parse", "HEAD"]);
	if (!head.ok) return failure("cwd_head_unavailable", "cwd git HEAD could not be resolved.");
	return { ok: true, cwd: { cwd: real, git_root: realpathSync(root.stdout.trim()), head: head.stdout.trim() } };
}

export function requireCleanParent(cwd: string): ErrorReceipt | null {
	const status = git(cwd, ["status", "--porcelain"]);
	if (!status.ok) return { code: "cwd_status_failed", message: status.stderr || "Could not inspect parent git status." };
	if (status.stdout.trim().length > 0) {
		return {
			code: "cwd_dirty_for_edit",
			message: "Write-capable profiles require a clean parent repository before pi-grok-build creates an assigned worktree.",
		};
	}
	return null;
}

export function parentMutated(cwd: string): boolean {
	const status = git(cwd, ["status", "--porcelain"]);
	return status.ok && status.stdout.trim().length > 0;
}

export function git(cwd: string, args: string[]): { ok: true; stdout: string; stderr: string } | { ok: false; stdout: string; stderr: string } {
	const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", timeout: 15000 });
	return result.status === 0
		? { ok: true, stdout: result.stdout ?? "", stderr: result.stderr ?? "" }
		: { ok: false, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function failure(code: string, message: string): { ok: false; error: ErrorReceipt } {
	return { ok: false, error: { code, message } };
}
