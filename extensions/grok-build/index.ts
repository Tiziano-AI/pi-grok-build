/** Pi Grok Build extension entrypoint. */

import type { ExtensionAPI, ExtensionContext, ToolResultEvent } from "@earendil-works/pi-coding-agent";
import { selectedTurn } from "./src/ledger.ts";
import { cancelAll, recentSessionDetails, runGrokBuild } from "./src/service.ts";
import { doctor, preflight } from "./src/native.ts";
import { isProfileId, profileTable } from "./src/profiles.ts";
import { GrokBuildInputSchema } from "./src/schemas.ts";
import { GrokBuildWidget, renderGrokBuildCall, renderGrokBuildResult } from "./src/rendering.ts";
import type { GrokBuildDetails, GrokBuildInput } from "./src/types.ts";

const WIDGET_KEY = "grok-build:fixed";
const MESSAGE_TYPE = "grok-build.command";

interface WidgetState {
	cards: GrokBuildDetails[];
	component: GrokBuildWidget | undefined;
}

/** Register the Pi-native Grok Build tool, slash command, and fixed widget. */
export default function piGrokBuildExtension(pi: ExtensionAPI) {
	registerPiGrokBuildExtension(pi);
}

export function registerPiGrokBuildExtension(pi: ExtensionAPI) {
	const widgets = new Map<string, WidgetState>();
	pi.on("session_shutdown", (event: { reason?: string }, ctx) => {
		cancelAll(event.reason ? `Parent Pi session shutdown: ${event.reason}.` : "Parent Pi session shutdown.");
		clearWidget(ctx, widgets);
	});
	pi.on("tool_result", (event) => grokBuildToolResultErrorOverride(event));
	pi.registerTool({
		name: "grok_build",
		label: "Grok Build",
		description: "Supervise xAI Grok Build through one Pi lifecycle tool backed by grok agent stdio: start, send, status, result, changes, cancel, cleanup. Operator diagnostics are slash-command only.",
		promptSnippet: "Supervise Grok Build sessions: start, send, status, result, changes, cancel, cleanup.",
		promptGuidelines: [
			"Use grok_build with action start only after explicit live/provider-use authorization; set confirm_provider_use:true only for that authorized prompt-carrying run.",
			"Use grok_build status/result with wait_seconds for bounded waits; result reports completed answers and terminal failed/cancelled turn errors without requiring a separate status call.",
			"Use grok_build changes only for worktree-edit or grounded-edit sessions after no turn is active; changes reads the assigned pi-grok-build worktree, not the parent repo.",
			"Use grok_build send for same-session follow-up after explicit live/provider-use authorization; use cancel for explicit stop and cleanup only for package-owned retained evidence.",
			"Do not ask grok_build for doctor or preflight; those are human /grok-build slash diagnostics only.",
		],
		parameters: GrokBuildInputSchema,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const result = await runGrokBuild(params as GrokBuildInput, ctx.cwd);
			updateWidget(ctx, widgets, [result.details, ...recentSessionDetails()]);
			return result;
		},
		renderCall: renderGrokBuildCall,
		renderResult: renderGrokBuildResult,
	});
	pi.registerCommand("grok-build", {
		description: "Operate Pi Grok Build diagnostics and sessions.",
		getArgumentCompletions(prefix: string) {
			const commands = ["doctor", "preflight", "jobs", "status", "result", "changes", "cancel", "cleanup", "start", "send", "clear"];
			const matches = commands.filter((command) => command.startsWith(prefix.trim()));
			return matches.length > 0 ? matches.map((value) => ({ value, label: value })) : null;
		},
		handler: async (args: string, ctx: ExtensionContext) => {
			const details = await runSlashCommand(args, ctx);
			if (details.action === "clear") {
				clearWidget(ctx, widgets);
				ctx.ui.notify("Pi Grok Build widget cleared.", "info");
				return;
			}
			updateWidget(ctx, widgets, [details, ...recentSessionDetails()]);
			pi.sendMessage<GrokBuildDetails>({ customType: MESSAGE_TYPE, content: commandMessage(details), display: true, details }, { triggerTurn: false });
		},
	});
}

export function grokBuildToolResultErrorOverride(event: ToolResultEvent): { isError: true } | undefined {
	if (event.toolName !== "grok_build") return undefined;
	const details = event.details as GrokBuildDetails | undefined;
	return details?.kind === "pi_grok_build" && details.ok === false ? { isError: true } : undefined;
}

async function runSlashCommand(args: string, ctx: ExtensionContext): Promise<GrokBuildDetails> {
	const tokens = splitArgs(args);
	const command = tokens[0] ?? "doctor";
	if (command === "doctor") return diagnosticDetails("doctor", ctx.cwd);
	if (command === "preflight") return diagnosticDetails("preflight", ctx.cwd);
	if (command === "jobs") return { kind: "pi_grok_build", action: "status", ok: true, message: "Recent pi-grok-build jobs." };
	if (command === "clear") return { kind: "pi_grok_build", action: "clear", ok: true, message: "Widget cleared." };
	if (command === "status" || command === "result" || command === "changes" || command === "cancel" || command === "cleanup") return runSessionSlash(command, tokens.slice(1), ctx.cwd);
	if (command === "start") return runStartSlash(tokens.slice(1), ctx);
	if (command === "send") return runSendSlash(tokens.slice(1), ctx);
	return { kind: "pi_grok_build", action: "preflight", ok: false, error: { code: "slash_command_unknown", message: `Unknown /grok-build command: ${command}` } };
}

function diagnosticDetails(action: "doctor" | "preflight", cwd: string): GrokBuildDetails {
	const diagnostic = action === "doctor" ? doctor(cwd) : preflight(cwd);
	return { kind: "pi_grok_build", action, ok: true, diagnostic, message: diagnostic.next };
}

async function runSessionSlash(command: "status" | "result" | "changes" | "cancel" | "cleanup", args: string[], cwd: string): Promise<GrokBuildDetails> {
	const session = args[0];
	if (!session) return { kind: "pi_grok_build", action: command, ok: false, error: { code: "session_required", message: `/grok-build ${command} requires a session handle.` } };
	const input = command === "status"
		? { action: "status" as const, session, preview: true }
		: command === "result"
			? { action: "result" as const, session, wait_seconds: 0, preview: true }
			: command === "changes"
				? { action: "changes" as const, session, preview: true }
				: command === "cancel"
					? { action: "cancel" as const, session, reason: args.slice(1).join(" ") || undefined }
					: { action: "cleanup" as const, session };
	return (await runGrokBuild(input, cwd)).details;
}

async function runStartSlash(args: string[], ctx: ExtensionContext): Promise<GrokBuildDetails> {
	const separator = args.indexOf("--");
	const profile = args[0] && isProfileId(args[0]) ? args[0] : "local-review";
	const task = separator >= 0 ? args.slice(separator + 1).join(" ") : args.slice(profile === args[0] ? 1 : 0).join(" ");
	if (!task.trim()) return { kind: "pi_grok_build", action: "start", ok: false, error: { code: "task_required", message: "/grok-build start requires a task. Example: /grok-build start local-review -- inspect this repo" } };
	const confirmed = await confirmProviderUse(ctx, "start", task);
	if (!confirmed) return { kind: "pi_grok_build", action: "start", ok: false, error: { code: "provider_use_not_confirmed", message: "Grok provider use was not confirmed." } };
	return (await runGrokBuild({ action: "start", cwd: ctx.cwd, task, profile, confirm_provider_use: true }, ctx.cwd)).details;
}

async function runSendSlash(args: string[], ctx: ExtensionContext): Promise<GrokBuildDetails> {
	const session = args[0];
	const separator = args.indexOf("--");
	const task = separator >= 0 ? args.slice(separator + 1).join(" ") : args.slice(1).join(" ");
	if (!session || !task.trim()) return { kind: "pi_grok_build", action: "send", ok: false, error: { code: "session_and_task_required", message: "/grok-build send requires a session and task. Example: /grok-build send g1 -- continue with X" } };
	const confirmed = await confirmProviderUse(ctx, "send", task);
	if (!confirmed) return { kind: "pi_grok_build", action: "send", ok: false, error: { code: "provider_use_not_confirmed", message: "Grok provider use was not confirmed." } };
	return (await runGrokBuild({ action: "send", session, task, confirm_provider_use: true }, ctx.cwd)).details;
}

async function confirmProviderUse(ctx: ExtensionContext, action: "start" | "send", task: string): Promise<boolean> {
	if (!ctx.hasUI) return false;
	return ctx.ui.confirm(`Launch Grok ${action}?`, `This sends prompt-carrying work to Grok/xAI. Task: ${task.slice(0, 240)}`);
}

function updateWidget(ctx: ExtensionContext, widgets: Map<string, WidgetState>, details: GrokBuildDetails[]): void {
	if (!ctx.hasUI) return;
	const sessionId = ctx.sessionManager.getSessionId();
	let state = widgets.get(sessionId);
	if (!state) {
		state = { cards: [], component: undefined };
		widgets.set(sessionId, state);
	}
	state.cards = compactWidgetDetails(details);
	if (state.component) {
		state.component.setDetails(state.cards);
		return;
	}
	ctx.ui.setWidget(WIDGET_KEY, (tui, theme) => {
		const component = new GrokBuildWidget(state?.cards ?? [], theme, () => tui.requestRender());
		if (state) state.component = component;
		return component;
	});
}

function clearWidget(ctx: ExtensionContext, widgets: Map<string, WidgetState>): void {
	const sessionId = ctx.sessionManager.getSessionId();
	widgets.delete(sessionId);
	if (ctx.hasUI) ctx.ui.setWidget(WIDGET_KEY, undefined);
}

function compactWidgetDetails(details: GrokBuildDetails[]): GrokBuildDetails[] {
	const seen = new Set<string>();
	const output: GrokBuildDetails[] = [];
	for (const detail of details) {
		const key = detail.session?.session ?? `${detail.action}:${detail.diagnostic?.action ?? detail.error?.code ?? output.length}`;
		if (seen.has(key)) continue;
		seen.add(key);
		output.push(detail);
		if (output.length >= 6) break;
	}
	return output;
}

function commandMessage(details: GrokBuildDetails): string {
	if (details.diagnostic) return [`# /grok-build ${details.diagnostic.action}`, "", details.diagnostic.next].join("\n");
	if (!details.ok) return [`# /grok-build ${details.action}`, "", `Error: ${details.error?.code ?? "error"} - ${details.error?.message ?? "unknown"}`].join("\n");
	if (details.cleanup) return [`# /grok-build cleanup`, "", `Deleted paths: ${details.cleanup.deleted_paths.length}`].join("\n");
	if (!details.session) return [`# /grok-build ${details.action}`, "", details.message ?? "OK"].join("\n");
	const turn = details.turn ?? selectedTurn(details.session);
	const lines = [`# /grok-build ${details.action}`, "", `Session ${details.session.session}: ${details.session.status}`, `Cursor: ${details.session.event_cursor}`];
	if (turn) lines.push(`Turn: ${turn.id} ${turn.state}`);
	if (turn?.media_artifacts?.length) lines.push("", "Media artifacts:", ...turn.media_artifacts.map((artifact) => `${artifact.id} ${artifact.kind} ${artifact.path}`));
	return lines.join("\n");
}

function splitArgs(args: string): string[] {
	return args.trim().split(/\s+/).filter(Boolean);
}

export function grokBuildProfilesForDocs() {
	return profileTable();
}
