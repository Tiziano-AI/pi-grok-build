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
	ambiguous: boolean;
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
		description: "Read-only bootstrap doctor for the Pi Grok Build package. Checks local Grok Build executable candidates and returns structured package/environment status.",
		promptSnippet: "Read-only bootstrap doctor for Pi Grok Build; action doctor checks local executable-candidate discovery.",
		promptGuidelines: [
			"Use grok_build with action doctor to inspect whether a Grok Build executable candidate is discoverable on PATH.",
			"Treat grok_build doctor output as package/environment discovery. Operational readiness needs the proof ladder in pi-grok-build docs.",
		],
		parameters: GrokBuildInputSchema,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const action = params.action ?? "doctor";
			if (action !== "doctor") throw new Error(`Unsupported grok_build action: ${String(action)}`);
			const executables = EXECUTABLE_CANDIDATES.map((name) => ({
				name,
				ambiguous: name === "grok",
				...findExecutableOnPath(name),
			}));
			const first = executables.find((candidate) => candidate.found);
			const candidateLine = first
				? `Found executable candidate: ${first.name} at ${first.path}${first.ambiguous ? " (ambiguous generic command)" : ""}`
				: "No grok-build or grok executable was found on PATH.";
			const lines = [
				"pi-grok-build bootstrap doctor",
				candidateLine,
				"Scope: package/environment discovery for this invocation.",
				"Current implementation: read-only doctor status. Operational delegation is the next design phase.",
				"Next implementation step: add an explicit Pi-native lifecycle contract after source review and live/provider-use consent design.",
			];
			const details: DoctorDetails = {
				kind: "pi_grok_build",
				action: "doctor",
				operational: false,
				cwd: ctx.cwd,
				executables,
				next: "Implement start/status/result/cancel/cleanup only after the consent, artifact, executable-identity, and launch-policy contract is accepted.",
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
