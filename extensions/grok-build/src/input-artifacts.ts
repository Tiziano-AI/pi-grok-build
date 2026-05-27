/** Local media admission and ACP embedded resource serialization. */

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { inputDir } from "./paths.ts";
import type { AcpResourceBlock, GrokBuildAttachmentInput, InputArtifact } from "./types.ts";

const IMAGE_MIME_BY_EXT: Record<string, string> = {
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
};

export const MIN_IMAGE_DIMENSION_PX = 8;
export const MIN_IMAGE_PIXELS = 512;

export class InputAdmissionError extends Error {
	readonly details: Record<string, unknown> | undefined;

	constructor(message: string, details?: Record<string, unknown>) {
		super(message);
		this.name = "InputAdmissionError";
		this.details = details;
	}
}

export function admitAndCopyInputs(args: { internalId: string; turnId: string; cwd: string; input?: GrokBuildAttachmentInput[]; extraRoots?: string[] }): InputArtifact[] {
	if (!args.input?.length) return [];
	const roots = [args.cwd, ...(args.extraRoots ?? [])].filter((root) => existsSync(root)).map((root) => realpathSync(root));
	const outDir = inputDir(args.internalId, args.turnId);
	mkdirSync(outDir, { recursive: true, mode: 0o700 });
	return args.input.map((entry, index) => admitOne(entry, index, roots, outDir));
}

function admitOne(entry: GrokBuildAttachmentInput, index: number, roots: string[], outDir: string): InputArtifact {
	if (isUrlOrData(entry.path)) throw new InputAdmissionError("input.path must be an absolute local file path, not a URL, data URI, or inline payload", { index });
	if (!entry.path.startsWith("/")) throw new InputAdmissionError("input.path must be absolute", { index });
	const candidate = resolve(entry.path);
	if (!existsSync(candidate)) throw new InputAdmissionError("input.path does not exist", { index });
	const real = realpathSync(candidate);
	const stat = statSync(real);
	if (!stat.isFile()) throw new InputAdmissionError("input.path must resolve to a regular file", { index });
	if (deniedControlRoot(real)) throw new InputAdmissionError("input.path resolves under a denied credential or control root", { index });
	if (!roots.some((root) => real === root || real.startsWith(`${root}/`))) {
		throw new InputAdmissionError("input.path must be under the admitted cwd or a prior pi-grok-build artifact root", { index, admitted_root_count: roots.length });
	}
	const mime = mimeFor(real, entry.kind);
	const id = `i${index + 1}`;
	const ext = extname(real).toLowerCase() || ".bin";
	const target = join(outDir, `${id}${ext}`);
	copyFileSync(real, target);
	const bytes = statSync(target).size;
	const dimensions = imageDimensions(target, mime);
	if (!dimensions) {
		throw new InputAdmissionError("image input dimensions could not be read from the local file header", { index, mime, minimum_dimension_px: MIN_IMAGE_DIMENSION_PX, minimum_pixels: MIN_IMAGE_PIXELS });
	}
	if (dimensions.width < MIN_IMAGE_DIMENSION_PX || dimensions.height < MIN_IMAGE_DIMENSION_PX || dimensions.width * dimensions.height < MIN_IMAGE_PIXELS) {
		throw new InputAdmissionError(`image input is ${dimensions.width}x${dimensions.height}; minimum supported dimensions are ${MIN_IMAGE_DIMENSION_PX}px per side and ${MIN_IMAGE_PIXELS} total pixels`, { index, width: dimensions.width, height: dimensions.height, minimum_dimension_px: MIN_IMAGE_DIMENSION_PX, minimum_pixels: MIN_IMAGE_PIXELS });
	}
	return {
		id,
		kind: entry.kind,
		purpose: entry.purpose,
		source_path: redactPath(real),
		path: target,
		mime,
		sha256: sha256(target),
		bytes,
		width: dimensions?.width ?? null,
		height: dimensions?.height ?? null,
	};
}

export function inputPromptSection(inputs: readonly InputArtifact[] | undefined): string {
	if (!inputs?.length) return "";
	const lines = ["## Local inputs", "The following local media inputs are attached as ACP embedded resource blobs and copied into pi-grok-build evidence."];
	for (const input of inputs) {
		lines.push(`- ${input.id}: ${input.kind}/${input.purpose}, evidence copy ${basename(input.path)}, sha256:${input.sha256.slice(0, 16)}`);
	}
	return `${lines.join("\n")}\n\n`;
}

export function inputResourceBlocks(inputs: readonly InputArtifact[] | undefined): AcpResourceBlock[] {
	if (!inputs?.length) return [];
	return inputs.map((input) => ({
		type: "resource",
		resource: {
			uri: `pi-grok-build://input/${input.id}`,
			mimeType: input.mime,
			blob: readFileSync(input.path).toString("base64"),
			_meta: {
				pi_grok_build: {
					id: input.id,
					kind: input.kind,
					purpose: input.purpose,
					sha256: input.sha256,
					bytes: input.bytes,
					width: input.width,
					height: input.height,
				},
			},
		},
	}));
}

export function mediaInputDimensionError(inputs: readonly InputArtifact[] | undefined): { code: string; message: string } | null {
	const invalid = inputs?.find((input) => input.width !== null && input.height !== null && (input.width < MIN_IMAGE_DIMENSION_PX || input.height < MIN_IMAGE_DIMENSION_PX || input.width * input.height < MIN_IMAGE_PIXELS));
	if (!invalid) return null;
	return { code: "media_input_dimension_invalid", message: `media_input_dimension_invalid: ${invalid.id} is ${invalid.width}x${invalid.height}; minimum supported image dimensions are ${MIN_IMAGE_DIMENSION_PX}px per side and ${MIN_IMAGE_PIXELS} total pixels.` };
}

function isUrlOrData(value: string): boolean {
	return /^[a-z][a-z0-9+.-]*:/i.test(value) || /^data:/i.test(value);
}

function deniedControlRoot(path: string): boolean {
	const home = homedir();
	const denied = [join(home, ".grok"), join(home, ".ssh"), join(home, ".aws"), join(home, ".config", "gcloud")].filter((root) => existsSync(root)).map((root) => realpathSync(root));
	return denied.some((root) => path === root || path.startsWith(`${root}/`));
}

function mimeFor(path: string, kind: GrokBuildAttachmentInput["kind"]): string {
	if (kind !== "image") throw new InputAdmissionError(`unsupported input kind: ${kind}`);
	const ext = extname(path).toLowerCase();
	const mime = IMAGE_MIME_BY_EXT[ext];
	if (!mime) throw new InputAdmissionError("image input must use a supported local image extension", { extension: ext || null, supported: Object.keys(IMAGE_MIME_BY_EXT) });
	return mime;
}

function sha256(path: string): string {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function redactPath(path: string): string {
	const home = homedir();
	return path.startsWith(`${home}/`) ? `~/${path.slice(home.length + 1)}` : path;
}

function readUInt24LE(buffer: Buffer, offset: number): number {
	return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function pngDimensions(buffer: Buffer): { width: number; height: number } | null {
	if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
	return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegDimensions(buffer: Buffer): { width: number; height: number } | null {
	if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
	let offset = 2;
	while (offset + 9 < buffer.length) {
		if (buffer[offset] !== 0xff) return null;
		const marker = buffer[offset + 1];
		offset += 2;
		if (marker === 0xd8 || marker === 0xd9) continue;
		if (offset + 2 > buffer.length) return null;
		const length = buffer.readUInt16BE(offset);
		if (length < 2 || offset + length > buffer.length) return null;
		if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
			return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
		}
		offset += length;
	}
	return null;
}

function webpDimensions(buffer: Buffer): { width: number; height: number } | null {
	if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
	const chunk = buffer.toString("ascii", 12, 16);
	if (chunk === "VP8X" && buffer.length >= 30) return { width: readUInt24LE(buffer, 24) + 1, height: readUInt24LE(buffer, 27) + 1 };
	if (chunk === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
		const b1 = buffer[21];
		const b2 = buffer[22];
		const b3 = buffer[23];
		const b4 = buffer[24];
		return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
	}
	if (chunk === "VP8 " && buffer.length >= 30) {
		for (let offset = 20; offset + 10 < buffer.length; offset += 1) {
			if (buffer[offset] === 0x9d && buffer[offset + 1] === 0x01 && buffer[offset + 2] === 0x2a) return { width: buffer.readUInt16LE(offset + 3) & 0x3fff, height: buffer.readUInt16LE(offset + 5) & 0x3fff };
		}
	}
	return null;
}

function imageDimensions(path: string, mime: string): { width: number; height: number } | null {
	const buffer = readFileSync(path);
	if (mime === "image/png") return pngDimensions(buffer);
	if (mime === "image/jpeg") return jpegDimensions(buffer);
	if (mime === "image/webp") return webpDimensions(buffer);
	return null;
}
