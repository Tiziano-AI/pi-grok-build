/** Pi Grok Build bootstrap extension. */

import { accessSync, constants } from "node:fs";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import { StringEnum } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const PACKAGE_VERSION = "0.0.4";
const ACTIONS = ["doctor", "preflight"] as const;
const EXECUTABLE_CANDIDATES = ["grok-build", "grok"] as const;
const DEFERRED_ACTIONS = ["start", "status", "result", "cancel", "cleanup"] as const;

const GrokBuildInputSchema = Type.Object(
	{
		action: Type.Optional(StringEnum(ACTIONS, { description: "Bootstrap action. Use doctor for package/PATH discovery or preflight for read-only readiness evidence." })),
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
	packageVersion: string;
	operational: false;
	cwd: string;
	executables: ExecutableProbe[];
	next: string;
}

interface PreflightCheck {
	id: string;
	status: "pass" | "warn" | "deferred";
	message: string;
}

interface PreflightDetails {
	kind: "pi_grok_build";
	action: "preflight";
	packageVersion: string;
	operational: false;
	cwd: string;
	claim: string;
	checks: PreflightCheck[];
	authority: {
		providerUse: false;
		networkUse: false;
		promptCarryingDelegation: false;
		filesystemMutation: false;
		artifactsWritten: false;
		rawLaunchFieldsAccepted: false;
	};
	executable: {
		candidateDiscovered: boolean;
		candidateCount: number;
		ambiguousCandidateCount: number;
		trustedIdentity: false;
		launched: false;
		candidates: ExecutableProbe[];
	};
	deferredActions: typeof DEFERRED_ACTIONS[number][];
	gaps: string[];
}

export default function piGrokBuildExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "grok_build",
		label: "Grok Build",
		description: "Read-only bootstrap tool for the Pi Grok Build package. doctor checks package/environment discovery; preflight returns foundational readiness evidence without launching Grok Build.",
		promptSnippet: "Read-only Pi Grok Build bootstrap tool: action doctor for discovery, action preflight for foundational readiness evidence.",
		promptGuidelines: [
			"Use grok_build with action doctor to inspect whether a Grok Build executable candidate is discoverable on PATH.",
			"Use grok_build with action preflight for read-only readiness evidence before any operational Grok Build delegation design.",
			"Treat grok_build doctor and preflight output as package/environment evidence. Operational delegation needs the proof ladder in pi-grok-build docs.",
		],
		parameters: GrokBuildInputSchema,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const action = params.action ?? "doctor";
			const executables = EXECUTABLE_CANDIDATES.map((name) => ({
				name,
				ambiguous: name === "grok",
				...findExecutableOnPath(name),
			}));
			if (action === "doctor") return buildDoctorResult(executables, ctx.cwd);
			if (action === "preflight") return buildPreflightResult(executables, ctx.cwd);
			throw new Error(`Unsupported grok_build action: ${String(action)}`);
		},
	});
}

function buildDoctorResult(executables: ExecutableProbe[], cwd: string) {
	const first = executables.find((candidate) => candidate.found);
	const candidateLine = first
		? `Found executable candidate: ${first.name} at ${first.path}${first.ambiguous ? " (ambiguous generic command)" : ""}`
		: "No grok-build or grok executable was found on PATH.";
	const lines = [
		"pi-grok-build bootstrap doctor",
		candidateLine,
		"Scope: package/environment discovery for this invocation.",
		"Current implementation: read-only doctor and preflight status. Operational delegation is a later phase.",
		"Next implementation step: accept the explicit Pi-native lifecycle contract before start/status/result/cancel/cleanup.",
	];
	const details: DoctorDetails = {
		kind: "pi_grok_build",
		action: "doctor",
		packageVersion: PACKAGE_VERSION,
		operational: false,
		cwd,
		executables,
		next: "Use action preflight for foundational readiness evidence. Implement start/status/result/cancel/cleanup only after consent, artifact, executable-identity, and launch-policy contracts are accepted.",
	};
	return { content: [{ type: "text" as const, text: lines.join("\n") }], details };
}

function buildPreflightResult(executables: ExecutableProbe[], cwd: string) {
	const found = executables.filter((candidate) => candidate.found);
	const ambiguous = found.filter((candidate) => candidate.ambiguous);
	const checks: PreflightCheck[] = [
		{
			id: "package_contract",
			status: "pass",
			message: "grok_build exposes read-only doctor and preflight actions.",
		},
		{
			id: "executable_candidate",
			status: found.length === 0 ? "warn" : ambiguous.length > 0 ? "warn" : "pass",
			message:
				found.length === 0
					? "No grok-build or grok executable candidate was found on PATH."
					: ambiguous.length > 0
						? "An executable candidate was found, including the ambiguous generic grok command."
						: "A non-ambiguous grok-build executable candidate was found on PATH.",
		},
		{
			id: "executable_identity_policy",
			status: "deferred",
			message: "Accepted executable identity policy is required before launch.",
		},
		{
			id: "consent_policy",
			status: "deferred",
			message: "Prompt-carrying Grok Build launch requires explicit consent or operator preauthorization.",
		},
		{
			id: "artifact_policy",
			status: "deferred",
			message: "Operational job artifact root and retention policy remain deferred.",
		},
		{
			id: "provider_proof",
			status: "deferred",
			message: "Provider, subscription, auth, and prompt behavior require future live proof.",
		},
	];
	const gaps = [
		...(found.length === 0 ? ["discover or configure a Grok Build executable candidate"] : []),
		...(ambiguous.length > 0 ? ["accepted identity policy for the ambiguous grok executable candidate"] : []),
		"accepted executable identity policy",
		"consent/preauthorization contract",
		"artifact root/job ownership contract",
		"bounded output contract",
		"live provider proof",
	];
	const details: PreflightDetails = {
		kind: "pi_grok_build",
		action: "preflight",
		packageVersion: PACKAGE_VERSION,
		operational: false,
		cwd,
		claim: "Read-only preflight evidence. No provider use, network use, prompt launch, filesystem mutation, or artifacts.",
		checks,
		authority: {
			providerUse: false,
			networkUse: false,
			promptCarryingDelegation: false,
			filesystemMutation: false,
			artifactsWritten: false,
			rawLaunchFieldsAccepted: false,
		},
		executable: {
			candidateDiscovered: found.length > 0,
			candidateCount: found.length,
			ambiguousCandidateCount: ambiguous.length,
			trustedIdentity: false,
			launched: false,
			candidates: executables,
		},
		deferredActions: [...DEFERRED_ACTIONS],
		gaps,
	};
	const lines = [
		"pi-grok-build bootstrap preflight",
		found.length > 0 ? `Executable candidates found: ${found.length}` : "Executable candidates found: 0",
		"Scope: read-only foundational readiness evidence for this invocation.",
		"Authority: package-local check with provider use, network use, prompt launch, filesystem mutation, artifacts, and Grok Build process launch all outside this action.",
		"Operational delegation remains deferred until the lifecycle contract is accepted.",
	];
	return { content: [{ type: "text" as const, text: lines.join("\n") }], details };
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
