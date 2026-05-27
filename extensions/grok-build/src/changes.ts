/** Assigned worktree ownership and git readback for Pi Grok Build. */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { assignedWorktreePath, changesDiffPath, changesSummaryPath } from "./paths.ts";
import { git, parentMutated } from "./cwd-policy.ts";
import type { ChangesSummary, SessionRecord, WorktreeReceipt } from "./types.ts";

export function createAssignedWorktree(args: { internalId: string; cwd: string; baseHead: string }): WorktreeReceipt {
	const path = assignedWorktreePath(args.internalId);
	if (!existsSync(path)) {
		mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
		const result = spawnSync("git", ["-C", args.cwd, "worktree", "add", "-q", "--detach", path, args.baseHead], { encoding: "utf8", timeout: 15000 });
		if (result.status !== 0) throw new Error(`failed to create assigned pi-grok-build worktree: ${result.stderr || result.stdout}`);
	}
	return { mode: "assigned", path, base_head: args.baseHead, parent_workspace_authorized: false };
}

export function removeAssignedWorktree(record: SessionRecord): string[] {
	const path = record.launch_spec.worktree.path;
	if (!path || record.launch_spec.worktree.mode !== "assigned") return [];
	return removeAssignedWorktreePath(record.git_root, path);
}

export function removeAssignedWorktreePath(gitRoot: string, path: string): string[] {
	spawnSync("git", ["-C", gitRoot, "worktree", "remove", "--force", path], { encoding: "utf8", timeout: 15000 });
	if (existsSync(path)) rmSync(path, { recursive: true, force: true });
	return [path];
}

export function materializeChanges(record: SessionRecord, preview: boolean): ChangesSummary {
	if (!record.profile.write_capable || record.launch_spec.worktree.mode !== "assigned" || !record.launch_spec.worktree.path) {
		return writeChanges(record, {
			state: record.status,
			profile: record.profile.id,
			execution_cwd: record.launch_spec.execution_cwd,
			worktree: { ...record.launch_spec.worktree, parent_workspace_mutated: parentMutated(record.git_root) },
			change_status: "unavailable",
			files: [],
			git_status: "",
			artifacts: { summary: null, diff: null },
			diff_preview: null,
		}, "", preview);
	}
	const executionCwd = record.launch_spec.worktree.path;
	const gitStatus = git(executionCwd, ["status", "--short"]);
	const base = record.launch_spec.worktree.base_head;
	const nameStatus = git(executionCwd, ["diff", "--name-status", base, "HEAD"]);
	const trackedDiff = git(executionCwd, ["diff", "--binary", base]);
	const untrackedDiffText = untrackedDiff(executionCwd);
	const diff = [trackedDiff.ok ? trackedDiff.stdout : "", untrackedDiffText].filter((chunk) => chunk.trim().length > 0).join("\n");
	const files = mergeChangedFiles(nameStatus.ok ? nameStatus.stdout : "", gitStatus.ok ? gitStatus.stdout : "");
	return writeChanges(record, {
		state: record.status,
		profile: record.profile.id,
		execution_cwd: executionCwd,
		worktree: { ...record.launch_spec.worktree, parent_workspace_mutated: parentMutated(record.git_root) },
		change_status: files.length > 0 || diff.trim().length > 0 ? "changed" : "no_changes",
		files,
		git_status: gitStatus.ok ? gitStatus.stdout : "",
		artifacts: { summary: null, diff: null },
		diff_preview: null,
	}, diff, preview);
}

function writeChanges(record: SessionRecord, summary: ChangesSummary, diff: string, preview: boolean): ChangesSummary {
	const summaryPath = changesSummaryPath(record.internal_id);
	const diffPath = changesDiffPath(record.internal_id);
	mkdirSync(dirname(summaryPath), { recursive: true, mode: 0o700 });
	const stored = { ...summary, artifacts: { summary: summaryPath, diff: diffPath }, diff_preview: preview ? diff.slice(0, 12000) : null };
	writeFileSync(summaryPath, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
	writeFileSync(diffPath, diff, "utf8");
	return stored;
}

function mergeChangedFiles(nameStatus: string, gitStatus: string): Array<{ path: string; status: string }> {
	const files = new Map<string, string>();
	for (const line of nameStatus.split(/\r?\n/)) {
		if (!line.trim()) continue;
		const [status, ...rest] = line.split(/\t+/);
		const path = rest.at(-1);
		if (status && path) files.set(path, status);
	}
	for (const line of gitStatus.split(/\r?\n/)) {
		if (!line.trim()) continue;
		const status = line.slice(0, 2).trim() || "?";
		const path = line.slice(3).trim();
		if (path) files.set(path, files.get(path) ?? status);
	}
	return [...files.entries()].map(([path, status]) => ({ path, status })).sort((left, right) => left.path.localeCompare(right.path));
}

function untrackedDiff(cwd: string): string {
	const list = git(cwd, ["ls-files", "--others", "--exclude-standard"]);
	if (!list.ok || !list.stdout.trim()) return "";
	const chunks: string[] = [];
	for (const file of list.stdout.split(/\r?\n/).filter(Boolean)) {
		const result = spawnSync("git", ["-C", cwd, "diff", "--binary", "--no-index", "--", "/dev/null", file], { encoding: "utf8", timeout: 15000 });
		if (result.stdout?.trim()) chunks.push(result.stdout);
	}
	return chunks.join("\n");
}
