/** Installed Grok CLI discovery and non-prompt diagnostics. */

import { accessSync, constants } from "node:fs";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import type { DiagnosticResult } from "./types.ts";

export const PACKAGE_VERSION = "0.0.4";

interface ExecutableProbe {
	name: string;
	found: boolean;
	path?: string;
	ambiguous?: boolean;
}

export function doctor(cwd: string): DiagnosticResult {
	const executables = executableCandidates();
	const grok = executables.find((candidate) => candidate.name === "grok" && candidate.found);
	const stdio = grok ? grokAgentStdioAvailable() : false;
	return {
		kind: "pi_grok_build",
		action: "doctor",
		packageVersion: PACKAGE_VERSION,
		operational: false,
		cwd,
		executables,
		next: stdio
			? "grok agent stdio is discoverable. Model-facing live actions still require explicit per-run provider-use confirmation."
			: "Install/authenticate Grok CLI with grok agent stdio before live pi-grok-build sessions.",
	};
}

export function preflight(cwd: string): DiagnosticResult {
	const executables = executableCandidates();
	const grok = executables.find((candidate) => candidate.name === "grok" && candidate.found);
	const stdio = grok ? grokAgentStdioAvailable() : false;
	return {
		kind: "pi_grok_build",
		action: "preflight",
		packageVersion: PACKAGE_VERSION,
		operational: false,
		cwd,
		executables,
		checks: [
			{ id: "tool_contract", status: "pass", message: "grok_build model actions are start, send, status, result, changes, cancel, cleanup." },
			{ id: "operator_diagnostics", status: "pass", message: "doctor/preflight are slash-command diagnostics only, not model-facing tool actions." },
			{ id: "grok_executable", status: grok ? "pass" : "warn", message: grok ? `grok found at ${grok.path}` : "grok was not found on PATH." },
			{ id: "grok_agent_stdio", status: stdio ? "pass" : "warn", message: stdio ? "grok agent stdio help is available." : "grok agent stdio was not proven by help output." },
			{ id: "provider_use", status: "deferred", message: "Prompt-carrying start/send require confirm_provider_use:true after explicit live/provider-use authorization." },
			{ id: "assigned_worktree", status: "deferred", message: "Write-capable starts create and prove package-owned assigned git worktrees at runtime." },
		],
		next: "Use /grok-build start only after explicit provider-use authorization; use grok_build for model lifecycle actions.",
	};
}

export function executableCandidates(): ExecutableProbe[] {
	return ["grok"].map((name) => ({ name, ambiguous: name === "grok", ...findExecutableOnPath(name) }));
}

export function grokAgentStdioAvailable(): boolean {
	const result = spawnSync("grok", ["agent", "stdio", "--help"], { encoding: "utf8", timeout: 10000 });
	const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
	return result.status === 0 || /stdio/i.test(combined);
}

export function grokVersion(): string | null {
	const result = spawnSync("grok", ["--no-auto-update", "--version"], { encoding: "utf8", timeout: 10000 });
	if (result.status !== 0) return null;
	return (result.stdout || result.stderr).trim() || null;
}

function findExecutableOnPath(name: string): Omit<ExecutableProbe, "name"> {
	for (const entry of (process.env.PATH ?? "").split(delimiter)) {
		if (!entry || !isAbsolute(entry)) continue;
		const candidate = resolve(join(entry, name));
		if (isExecutable(candidate)) return { found: true, path: candidate };
	}
	return { found: false };
}

function isExecutable(path: string): boolean {
	try {
		accessSync(path, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
