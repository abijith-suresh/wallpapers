import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import {
  MAX_WALLPAPER_FILE_SIZE_BYTES,
  PUBLIC_FILES_DIR,
  ROOT_WALLPAPERS_DIR,
  isSupportedWallpaperFile,
} from "../src/lib/wallpapers";

const checkOnly = process.argv.includes("--check");
const manifestPath = path.join(process.cwd(), "wallpapers.json");

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function readManifestKeys(): Promise<string[]> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;

    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      throw new Error("wallpapers.json must contain an object keyed by wallpaper filename");
    }

    return Object.keys(manifest);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`wallpapers.json is not valid JSON: ${error.message}`);
    }

    throw error;
  }
}

async function main(): Promise<void> {
  await mkdir(ROOT_WALLPAPERS_DIR, { recursive: true });

  const entries = await readdir(ROOT_WALLPAPERS_DIR, { withFileTypes: true });
  const wallpaperFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => !fileName.startsWith("."))
    .sort((left, right) => left.localeCompare(right));

  const unsupportedFiles = wallpaperFiles.filter((fileName) => !isSupportedWallpaperFile(fileName));
  if (unsupportedFiles.length > 0) {
    throw new Error(`Unsupported files in wallpapers/: ${unsupportedFiles.join(", ")}`);
  }

  for (const fileName of wallpaperFiles) {
    const filePath = path.join(ROOT_WALLPAPERS_DIR, fileName);
    const fileStat = await stat(filePath);

    if (fileStat.size > MAX_WALLPAPER_FILE_SIZE_BYTES) {
      throw new Error(
        `${fileName} is ${formatBytes(fileStat.size)}; max is ${formatBytes(
          MAX_WALLPAPER_FILE_SIZE_BYTES
        )}`
      );
    }
  }

  const manifestKeys = await readManifestKeys();
  const missingFiles = manifestKeys.filter((fileName) => !wallpaperFiles.includes(fileName));
  if (missingFiles.length > 0) {
    throw new Error(`wallpapers.json references missing files: ${missingFiles.join(", ")}`);
  }

  if (checkOnly) {
    return;
  }

  await rm(PUBLIC_FILES_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_FILES_DIR, { recursive: true });

  for (const fileName of wallpaperFiles) {
    await cp(path.join(ROOT_WALLPAPERS_DIR, fileName), path.join(PUBLIC_FILES_DIR, fileName));
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
