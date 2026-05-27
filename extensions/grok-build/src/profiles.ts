/** Curated Pi Grok Build capability profiles. */

import { PROFILE_IDS, type ProfileDefinition, type ProfileId } from "./types.ts";

export const PROFILES: Record<ProfileId, ProfileDefinition> = {
	"local-review": {
		id: "local-review",
		description: "Local source and repository review without web/current evidence or mutation.",
		write_capable: false,
		web: false,
		media: false,
		sandbox_profile: "read-only",
		subagents: "disabled",
		web_search: "disabled",
		tools: ["read", "grep", "glob"],
		disallowed_tools: ["write", "search_replace", "web_search", "open_page", "image_gen"],
		turn_activity_timeout_ms: 60000,
	},
	"grounded-review": {
		id: "grounded-review",
		description: "Repository review that needs current docs, web, or X evidence without mutation.",
		write_capable: false,
		web: true,
		media: false,
		sandbox_profile: "read-only",
		subagents: "enabled",
		web_search: "enabled",
		tools: ["read", "grep", "glob", "web_search", "open_page", "web_fetch"],
		disallowed_tools: ["write", "search_replace", "image_gen"],
		turn_activity_timeout_ms: 90000,
	},
	"deep-research": {
		id: "deep-research",
		description: "Broad external/current research with Grok decomposition and no local mutation.",
		write_capable: false,
		web: true,
		media: false,
		sandbox_profile: "read-only",
		subagents: "enabled",
		web_search: "enabled",
		tools: ["web_search", "open_page", "web_fetch"],
		disallowed_tools: ["write", "search_replace", "image_gen"],
		turn_activity_timeout_ms: 120000,
	},
	"worktree-edit": {
		id: "worktree-edit",
		description: "Candidate implementation in a pi-grok-build-owned assigned git worktree.",
		write_capable: true,
		web: false,
		media: false,
		sandbox_profile: "workspace",
		subagents: "enabled",
		web_search: "disabled",
		tools: ["read", "grep", "glob", "write", "search_replace"],
		disallowed_tools: ["web_search", "open_page", "web_fetch", "image_gen"],
		turn_activity_timeout_ms: 90000,
	},
	"grounded-edit": {
		id: "grounded-edit",
		description: "Current-doc-informed candidate implementation in an assigned git worktree.",
		write_capable: true,
		web: true,
		media: false,
		sandbox_profile: "workspace",
		subagents: "enabled",
		web_search: "enabled",
		tools: ["read", "grep", "glob", "write", "search_replace", "web_search", "open_page", "web_fetch"],
		disallowed_tools: ["image_gen"],
		turn_activity_timeout_ms: 120000,
	},
	media: {
		id: "media",
		description: "Governed image/video generation or editing with artifact-first media output.",
		write_capable: false,
		web: false,
		media: true,
		sandbox_profile: "read-only",
		subagents: "disabled",
		web_search: "disabled",
		tools: ["image_gen"],
		disallowed_tools: ["write", "search_replace", "web_search", "open_page", "web_fetch"],
		turn_activity_timeout_ms: 120000,
	},
};

export function resolveProfile(id: ProfileId | undefined): ProfileDefinition {
	return PROFILES[id ?? "local-review"];
}

export function isProfileId(value: string): value is ProfileId {
	return (PROFILE_IDS as readonly string[]).includes(value);
}

export function profileTable(): Array<Pick<ProfileDefinition, "id" | "description" | "write_capable" | "web" | "media">> {
	return PROFILE_IDS.map((id) => {
		const profile = PROFILES[id];
		return {
			id: profile.id,
			description: profile.description,
			write_capable: profile.write_capable,
			web: profile.web,
			media: profile.media,
		};
	});
}
