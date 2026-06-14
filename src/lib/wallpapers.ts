import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const ROOT_WALLPAPERS_DIR = path.join(process.cwd(), "wallpapers");
export const PUBLIC_FILES_DIR = path.join(process.cwd(), "public", "files");
export const MAX_WALLPAPER_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

interface WallpaperManifestEntry {
  creator?: string;
  source?: string;
}

type WallpaperManifest = Record<string, WallpaperManifestEntry>;

export interface Wallpaper {
  fileName: string;
  title: string;
  url: string;
  creator?: string;
  source?: string;
}

export function isSupportedWallpaperFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export function titleFromFileName(fileName: string): string {
  const baseName = path.basename(fileName, path.extname(fileName));

  return baseName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function wallpaperUrl(baseUrl: string, fileName: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `${normalizedBase}files/${encodeURIComponent(fileName)}`;
}

async function readManifest(): Promise<WallpaperManifest> {
  try {
    const manifest = JSON.parse(
      await readFile(path.join(process.cwd(), "wallpapers.json"), "utf8")
    );

    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      return {};
    }

    return manifest as WallpaperManifest;
  } catch {
    return {};
  }
}

export async function getWallpapers(baseUrl: string): Promise<Wallpaper[]> {
  const entries = await readdir(ROOT_WALLPAPERS_DIR, { withFileTypes: true });
  const manifest = await readManifest();

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => !fileName.startsWith(".") && isSupportedWallpaperFile(fileName))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => ({
      fileName,
      title: titleFromFileName(fileName),
      url: wallpaperUrl(baseUrl, fileName),
      ...manifest[fileName],
    }));
}
