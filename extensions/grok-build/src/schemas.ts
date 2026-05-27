/** TypeBox schema for the operational `grok_build` Pi tool. */

import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { MODEL_ACTIONS, PROFILE_IDS } from "./types.ts";

const AttachmentSchema = Type.Object(
	{
		path: Type.String({ description: "Absolute local image path under the admitted cwd or a prior pi-grok-build artifact root." }),
		kind: StringEnum(["image"] as const),
		purpose: StringEnum(["reference", "edit", "mask"] as const),
	},
	{ additionalProperties: false },
);

const waitSeconds = Type.Optional(Type.Number({ minimum: 0, maximum: 60, multipleOf: 1 }));
const preview = Type.Optional(Type.Boolean());
const session = Type.Optional(Type.String({ minLength: 2, maxLength: 64, pattern: "^g[1-9][0-9]{0,7}$" }));

export const GrokBuildInputSchema = Type.Object(
	{
		action: StringEnum(MODEL_ACTIONS),
		task: Type.Optional(Type.String({ minLength: 1, maxLength: 50000 })),
		cwd: Type.Optional(Type.String({ minLength: 1, maxLength: 4096 })),
		profile: Type.Optional(StringEnum(PROFILE_IDS)),
		input: Type.Optional(Type.Array(AttachmentSchema, { maxItems: 8 })),
		confirm_provider_use: Type.Optional(Type.Boolean({ description: "Must be true only after explicit live/provider-use authorization for prompt-carrying Grok work." })),
		session,
		cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 128 })),
		wait_seconds: waitSeconds,
		preview,
		turn: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
		interrupt: Type.Optional(Type.Boolean()),
		reason: Type.Optional(Type.String({ minLength: 1, maxLength: 1000 })),
	},
	{
		additionalProperties: false,
		description: `Operational actions only: ${MODEL_ACTIONS.join(" | ")}. Operator diagnostics are exposed by /grok-build, not this model-facing schema. Action-specific required fields are validated by the extension dispatcher.`,
	},
);
