/** Media output artifact harvesting from Grok answer paths. */

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { basename, extname, relative, resolve } from "node:path";
import { mediaDir } from "./paths.ts";
import type { MediaOutputArtifact } from "./types.ts";

const MEDIA_PATH_PATTERN = /\/[\w%+.,:@\/-]+?\.(?:jpe?g|png|webp|mp4|mov|webm)/gi;

export function harvestMediaOutputArtifacts(internalId: string, turnId: string, answer: string): MediaOutputArtifact[] {
	const candidates = uniqueMediaPaths(answer).filter(isAdmittedGrokMediaPath);
	if (candidates.length === 0) return [];
	const dir = mediaDir(internalId, turnId);
	mkdirSync(dir, { recursive: true, mode: 0o700 });
	return candidates.map((sourcePath, index) => copyMediaArtifact(sourcePath, dir, index + 1));
}

function uniqueMediaPaths(text: string): string[] {
	const paths: string[] = [];
	const seen = new Set<string>();
	for (const match of text.matchAll(MEDIA_PATH_PATTERN)) {
		const candidate = resolve(match[0]);
		if (seen.has(candidate)) continue;
		seen.add(candidate);
		paths.push(candidate);
	}
	return paths;
}

function isAdmittedGrokMediaPath(path: string): boolean {
	const root = resolve(homedir(), ".grok", "sessions");
	const rel = relative(root, path);
	if (rel.startsWith("..") || rel === "" || rel.startsWith("/")) return false;
	if (!existsSync(path)) return false;
	const stats = statSync(path);
	return stats.isFile();
}

function copyMediaArtifact(sourcePath: string, dir: string, index: number): MediaOutputArtifact {
	const id = `m${index}`;
	const ext = extname(sourcePath).toLowerCase();
	const safeName = basename(sourcePath).replace(/[^A-Za-z0-9._-]/g, "_");
	const destination = resolve(dir, `${id}-${safeName}`);
	copyFileSync(sourcePath, destination);
	const data = readFileSync(destination);
	return {
		id,
		kind: mediaKind(ext),
		source_path: sourcePath,
		path: destination,
		mime: mimeForExtension(ext),
		sha256: createHash("sha256").update(data).digest("hex"),
		bytes: data.byteLength,
	};
}

function mediaKind(ext: string): "image" | "video" {
	return [".mp4", ".mov", ".webm"].includes(ext) ? "video" : "image";
}

function mimeForExtension(ext: string): string {
	if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
	if (ext === ".png") return "image/png";
	if (ext === ".webp") return "image/webp";
	if (ext === ".mp4") return "video/mp4";
	if (ext === ".mov") return "video/quicktime";
	if (ext === ".webm") return "video/webm";
	return "application/octet-stream";
}
