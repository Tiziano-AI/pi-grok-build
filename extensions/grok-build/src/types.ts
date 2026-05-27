/** Shared contracts for the Pi Grok Build extension. */

export const MODEL_ACTIONS = ["start", "send", "status", "result", "changes", "cancel", "cleanup"] as const;
export const OPERATOR_ACTIONS = ["doctor", "preflight", "clear"] as const;
export const PROFILE_IDS = ["local-review", "grounded-review", "deep-research", "worktree-edit", "grounded-edit", "media"] as const;

export type ModelAction = (typeof MODEL_ACTIONS)[number];
export type OperatorAction = (typeof OPERATOR_ACTIONS)[number];
export type ProfileId = (typeof PROFILE_IDS)[number];

export type SessionStatus = "starting" | "turn_active" | "idle" | "failed" | "cancelled" | "cleaned";
export type TurnState = "queued" | "sent" | "streaming" | "completed" | "failed" | "cancelled" | "dropped";

export interface GrokBuildAttachmentInput {
	path: string;
	kind: "image";
	purpose: "reference" | "edit" | "mask";
}

export interface StartInput {
	action: "start";
	task: string;
	cwd?: string;
	profile?: ProfileId;
	input?: GrokBuildAttachmentInput[];
	confirm_provider_use: boolean;
}

export interface SendInput {
	action: "send";
	session: string;
	task: string;
	input?: GrokBuildAttachmentInput[];
	interrupt?: boolean;
	confirm_provider_use: boolean;
}

export interface StatusInput {
	action: "status";
	session: string;
	cursor?: string;
	wait_seconds?: number;
	preview?: boolean;
}

export interface ResultInput {
	action: "result";
	session: string;
	turn?: string;
	wait_seconds?: number;
	preview?: boolean;
}

export interface ChangesInput {
	action: "changes";
	session: string;
	preview?: boolean;
}

export interface CancelInput {
	action: "cancel";
	session: string;
	reason?: string;
}

export interface CleanupInput {
	action: "cleanup";
	session: string;
}

export type GrokBuildInput = StartInput | SendInput | StatusInput | ResultInput | ChangesInput | CancelInput | CleanupInput;

export interface ProfileDefinition {
	id: ProfileId;
	description: string;
	write_capable: boolean;
	web: boolean;
	media: boolean;
	sandbox_profile: "read-only" | "workspace" | "strict";
	subagents: "enabled" | "disabled";
	web_search: "enabled" | "disabled";
	tools: string[];
	disallowed_tools: string[];
	turn_activity_timeout_ms: number;
}

export interface AdmittedCwd {
	cwd: string;
	git_root: string;
	head: string;
}

export interface InputArtifact {
	id: string;
	kind: "image";
	purpose: "reference" | "edit" | "mask";
	source_path: string;
	path: string;
	mime: string;
	sha256: string;
	bytes: number;
	width: number | null;
	height: number | null;
}

export interface AcpResourceBlock {
	type: "resource";
	resource: {
		uri: string;
		mimeType: string;
		blob: string;
		_meta: {
			pi_grok_build: {
				id: string;
				kind: "image";
				purpose: "reference" | "edit" | "mask";
				sha256: string;
				bytes: number;
				width: number | null;
				height: number | null;
			};
		};
	};
}

export interface MediaOutputArtifact {
	id: string;
	kind: "image" | "video";
	source_path: string;
	path: string;
	mime: string;
	sha256: string;
	bytes: number;
}

export interface TurnRecord {
	id: string;
	index: number;
	task: string;
	state: TurnState;
	created_at: string;
	sent_at?: string;
	completed_at?: string;
	answer_path?: string;
	answer_chars?: number;
	input_artifacts?: InputArtifact[];
	media_artifacts?: MediaOutputArtifact[];
	error?: ErrorReceipt;
}

export interface ErrorReceipt {
	code: string;
	message: string;
}

export interface WorktreeReceipt {
	mode: "assigned" | "none";
	path: string | null;
	base_head: string;
	parent_workspace_authorized: false;
}

export interface LaunchSpec {
	command: "grok";
	args: string[];
	product_path: "grok agent stdio";
	execution_cwd: string;
	prompt_text: string;
	profile: { id: ProfileId; write_capable: boolean };
	worktree: WorktreeReceipt;
	sandbox_proof_required_before_prompt: true;
	assigned_worktree_required: boolean;
}

export interface SessionRecord {
	kind: "pi_grok_build_session";
	internal_id: string;
	session: string;
	status: SessionStatus;
	created_at: string;
	updated_at: string;
	cwd: string;
	git_root: string;
	profile: ProfileDefinition;
	launch_spec: LaunchSpec;
	turns: TurnRecord[];
	active_turn_id?: string;
	event_cursor: number;
	error?: ErrorReceipt;
	pid?: number;
}

export interface SessionEvent {
	seq: number;
	at: string;
	type: string;
	turn?: string;
	message: string;
	data?: Record<string, unknown>;
	material: boolean;
}

export interface ChangesSummary {
	state: SessionStatus;
	profile: ProfileId;
	execution_cwd: string;
	worktree: WorktreeReceipt & { parent_workspace_mutated: boolean };
	change_status: "changed" | "no_changes" | "unavailable";
	files: Array<{ path: string; status: string }>;
	git_status: string;
	artifacts: { summary: string | null; diff: string | null };
	diff_preview?: string | null;
}

export interface DiagnosticResult {
	kind: "pi_grok_build";
	action: "doctor" | "preflight";
	packageVersion: string;
	operational: false;
	cwd: string;
	checks?: Array<{ id: string; status: "pass" | "warn" | "deferred"; message: string }>;
	executables: Array<{ name: string; found: boolean; path?: string; ambiguous?: boolean }>;
	next: string;
}

export interface GrokBuildDetails {
	kind: "pi_grok_build";
	action: ModelAction | "doctor" | "preflight" | "clear";
	ok: boolean;
	error?: ErrorReceipt;
	session?: SessionRecord;
	turn?: TurnRecord | null;
	wait?: { requested: boolean; outcome: "not_requested" | "completed" | "material" | "terminal" | "timeout"; elapsed_ms: number };
	changes?: ChangesSummary | null;
	diagnostic?: DiagnosticResult;
	cleanup?: { session: string; deleted_paths: string[] };
	message?: string;
}
