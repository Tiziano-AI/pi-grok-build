/** Pi Grok Build bootstrap extension. */

import { accessSync, constants } from "node:fs";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import { StringEnum } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const ACTIONS = ["doctor"] as const;
const EXECUTABLE_CANDIDATES = ["grok-build", "grok"] as const;

const GrokBuildInputSchema = Type.Object(
	{
		action: Type.Optional(StringEnum(ACTIONS, { description: "Bootstrap action. Only doctor is implemented in pi-grok-build 0.0.x." })),
	},
	{ additionalProperties: false },
);

interface ExecutableProbe {
	name: string;
	found: boolean;
	path?: string;
}

interface DoctorDetails {
	kind: "pi_grok_build";
	action: "doctor";
	operational: false;
	cwd: string;
	executables: ExecutableProbe[];
	next: string;
}

export default function piGrokBuildExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "grok_build",
		label: "Grok Build",
		description: "Read-only bootstrap doctor for the Pi Grok Build package. Checks local Grok Build executable discovery only; this 0.0.x release does not launch Grok Build or send prompts.",
		promptSnippet: "Read-only bootstrap doctor for Pi Grok Build; action doctor checks local executable discovery only.",
		promptGuidelines: [
			"Use grok_build with action doctor only to inspect whether a Grok Build executable is discoverable on PATH.",
			"Do not treat grok_build doctor output as proof of Grok Build login, subscription, prompt behavior, worktree safety, or operational delegation.",
		],
		parameters: GrokBuildInputSchema,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const action = params.action ?? "doctor";
			if (action !== "doctor") throw new Error(`Unsupported grok_build action: ${String(action)}`);
			const executables = EXECUTABLE_CANDIDATES.map((name) => ({ name, ...findExecutableOnPath(name) }));
			const first = executables.find((candidate) => candidate.found);
			const lines = [
				"pi-grok-build bootstrap doctor",
				first ? `Found Grok Build candidate: ${first.name} at ${first.path}` : "No grok-build or grok executable was found on PATH.",
				"This 0.0.x bootstrap release does not launch Grok Build, send prompts, spend provider quota, edit files, or manage delegated sessions.",
				"Next implementation step: add an explicit Pi-native lifecycle contract after source review and live/provider-use consent design.",
			];
			const details: DoctorDetails = {
				kind: "pi_grok_build",
				action: "doctor",
				operational: false,
				cwd: ctx.cwd,
				executables,
				next: "Implement start/status/result/cancel/cleanup only after the consent, artifact, and launch-policy contract is accepted.",
			};
			return { content: [{ type: "text", text: lines.join("\n") }], details };
		},
	});
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
