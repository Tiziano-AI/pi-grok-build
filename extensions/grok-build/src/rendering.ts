/** Compact TUI rendering and fixed widget for Pi Grok Build. */

import type { AgentToolResult, Theme, ToolRenderResultOptions } from "@earendil-works/pi-coding-agent";
import { Text, truncateToWidth, type Component } from "@earendil-works/pi-tui";
import { answerText, selectedTurn } from "./ledger.ts";
import type { GrokBuildDetails, GrokBuildInput, SessionRecord } from "./types.ts";

interface RenderContext {
	lastComponent?: Component;
}

export class GrokBuildWidget implements Component {
	private details: GrokBuildDetails[];
	private readonly theme: Theme;
	private readonly requestRender: (() => void) | undefined;
	private cachedWidth: number | undefined;
	private cachedLines: string[] | undefined;

	constructor(details: GrokBuildDetails[], theme: Theme, requestRender?: () => void) {
		this.details = details;
		this.theme = theme;
		this.requestRender = requestRender;
	}

	setDetails(details: GrokBuildDetails[]): void {
		this.details = details;
		this.invalidate();
		this.requestRender?.();
	}

	render(width: number): string[] {
		if (this.cachedWidth === width && this.cachedLines) return this.cachedLines;
		const safeWidth = Math.max(1, width);
		const lines = formatWidget(this.details, this.theme).map((line) => truncateToWidth(line, safeWidth));
		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}
}

export function renderGrokBuildCall(args: GrokBuildInput, theme: Theme, context?: RenderContext): Component {
	const text = reuseText(context?.lastComponent);
	text.setText(formatCall(args, theme));
	return text;
}

export function renderGrokBuildResult(result: AgentToolResult<GrokBuildDetails>, options: ToolRenderResultOptions, theme: Theme, context?: RenderContext): Component {
	const text = reuseText(context?.lastComponent);
	const details = result.details;
	text.setText(details ? formatCard(details, theme, options.expanded).join("\n") : theme.fg("dim", "grok_build: no details"));
	return text;
}

export function formatCard(details: GrokBuildDetails, theme: Theme, expanded: boolean): string[] {
	if (details.diagnostic) return formatDiagnostic(details, theme);
	if (!details.ok) return [`${title(theme)} ${theme.fg("error", `${details.action} error`)} ${theme.fg("dim", details.error?.code ?? "unknown")}`, `  ${theme.fg("dim", details.error?.message ?? "No error message.")}`];
	if (details.cleanup) return [`${title(theme)} ${theme.fg("success", "evidence deleted")} ${theme.fg("dim", `${details.cleanup.deleted_paths.length} path(s)`)}`];
	const session = details.session;
	if (!session) return [`${title(theme)} ${theme.fg("success", `${details.action} ok`)}`];
	const turn = details.turn ?? selectedTurn(session);
	const lines = [`${title(theme)} ${theme.fg(statusColor(session.status), stateText(details, session))} ${theme.fg("dim", `${session.session} ${session.profile.id}`)}`];
	lines.push(`${theme.fg("muted", "cursor")} ${theme.fg("dim", String(session.event_cursor))}`);
	if (turn) lines.push(`${theme.fg("muted", "turn")} ${theme.fg(turnColor(turn.state), `${turn.id} ${turn.state}`)}${turn.error ? ` ${theme.fg("warning", turn.error.code)}` : ""}`);
	if (details.wait) lines.push(`${theme.fg("muted", "wait")} ${theme.fg(details.wait.outcome === "timeout" ? "warning" : "success", details.wait.outcome)} ${theme.fg("dim", `${details.wait.elapsed_ms}ms`)}`);
	if (details.changes) lines.push(`${theme.fg("muted", "changes")} ${theme.fg(details.changes.change_status === "changed" ? "accent" : "dim", details.changes.change_status)} ${theme.fg("dim", details.changes.files.slice(0, 3).map((file) => file.path).join(", ") || "no files")}`);
	if (turn?.media_artifacts?.length) lines.push(`${theme.fg("muted", "media")} ${theme.fg("dim", turn.media_artifacts.slice(0, 3).map((artifact) => artifact.path).join(", "))}`);
	if (expanded) {
		const answer = answerText(turn ?? null, true);
		if (answer) lines.push(`${theme.fg("muted", "answer")} ${theme.fg("dim", oneLine(answer, 120))}`);
		lines.push(`${theme.fg("muted", "artifacts")} ${theme.fg("dim", session.internal_id)}`);
	}
	return lines;
}

function formatWidget(details: GrokBuildDetails[], theme: Theme): string[] {
	const sessions = details.map((item) => item.session).filter((session): session is SessionRecord => Boolean(session));
	const diagnostic = details.find((item) => item.diagnostic)?.diagnostic;
	if (sessions.length === 0 && !diagnostic) return [];
	const active = sessions.filter((session) => session.status === "starting" || session.status === "turn_active");
	const attention = sessions.filter((session) => session.status === "failed");
	const headerTail = active.length > 0 ? `${active.length} active` : attention.length > 0 ? `${attention.length} need attention` : diagnostic ? diagnostic.action : `${sessions.length} recent`;
	const lines = [`${title(theme)} ${theme.fg(active.length > 0 ? "accent" : attention.length > 0 ? "warning" : "muted", headerTail)}`];
	const visible = [...active, ...attention, ...sessions.filter((session) => !active.includes(session) && !attention.includes(session))].slice(0, 3);
	for (const session of visible) lines.push(widgetSessionLine(session, theme));
	if (diagnostic && visible.length === 0) lines.push(`${theme.fg("muted", diagnostic.action)} ${theme.fg("dim", diagnostic.next)}`);
	if (sessions.length > visible.length) lines.push(theme.fg("dim", `+${sessions.length - visible.length} more`));
	return lines.slice(0, 5);
}

function widgetSessionLine(session: SessionRecord, theme: Theme): string {
	const turn = selectedTurn(session);
	const marker = session.status === "turn_active" || session.status === "starting" ? "›" : session.status === "failed" ? "!" : session.status === "cancelled" ? "×" : "·";
	const activity = turn?.error?.code ?? turn?.state ?? session.status;
	return `  ${theme.fg(statusColor(session.status), marker)} ${theme.fg("text", session.session)} ${theme.fg("dim", session.profile.id)} ${theme.fg("muted", activity)}`;
}

function formatDiagnostic(details: GrokBuildDetails, theme: Theme): string[] {
	const diagnostic = details.diagnostic;
	if (!diagnostic) return [`${title(theme)} ${theme.fg("dim", "diagnostic unavailable")}`];
	const found = diagnostic.executables.filter((item) => item.found).map((item) => item.name).join(", ") || "no grok";
	const lines = [`${title(theme)} ${theme.fg("accent", diagnostic.action)} ${theme.fg("dim", found)}`];
	const warn = diagnostic.checks?.find((check) => check.status === "warn");
	if (warn) lines.push(`  ${theme.fg("warning", warn.id)} ${theme.fg("dim", warn.message)}`);
	else lines.push(`  ${theme.fg("muted", "next")} ${theme.fg("dim", diagnostic.next)}`);
	return lines;
}

function formatCall(args: GrokBuildInput, theme: Theme): string {
	const action = args.action;
	if (action === "start") return `${title(theme)} ${theme.fg("accent", "start")} ${theme.fg("dim", `${args.profile ?? "local-review"} ${oneLine(args.task, 72)}`)}`;
	if (action === "send") return `${title(theme)} ${theme.fg("accent", "send")} ${theme.fg("dim", `${args.session} ${oneLine(args.task, 72)}`)}`;
	if (action === "status") return `${title(theme)} ${theme.fg("accent", args.wait_seconds ? `status wait ${args.wait_seconds}s` : "status")} ${theme.fg("dim", args.session)}`;
	if (action === "result") return `${title(theme)} ${theme.fg("accent", args.wait_seconds ? `result wait ${args.wait_seconds}s` : "result")} ${theme.fg("dim", args.session)}`;
	return `${title(theme)} ${theme.fg("accent", action)} ${theme.fg("dim", args.session)}`;
}

function stateText(details: GrokBuildDetails, session: SessionRecord): string {
	if (details.action === "start") return "started";
	if (details.action === "send") return "queued";
	if (details.action === "changes") return "changes";
	return session.status;
}

function title(theme: Theme): string {
	return theme.fg("toolTitle", theme.bold("grok_build"));
}

function statusColor(status: SessionRecord["status"]): "accent" | "success" | "warning" | "error" | "muted" {
	if (status === "turn_active" || status === "starting") return "accent";
	if (status === "idle") return "success";
	if (status === "cancelled") return "warning";
	if (status === "failed") return "error";
	return "muted";
}

function turnColor(status: string): "accent" | "success" | "warning" | "error" | "muted" {
	if (status === "sent" || status === "streaming") return "accent";
	if (status === "completed") return "success";
	if (status === "failed") return "error";
	if (status === "cancelled" || status === "dropped") return "warning";
	return "muted";
}

function reuseText(component: Component | undefined): Text {
	return component instanceof Text ? component : new Text("", 0, 0);
}

function oneLine(text: string, chars: number): string {
	const compact = text.replace(/\s+/g, " ").trim();
	const codepoints = Array.from(compact);
	return codepoints.length > chars ? `${codepoints.slice(0, Math.max(1, chars - 1)).join("")}…` : compact;
}
