import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const ROOT_WALLPAPERS_DIR = path.join(process.cwd(), "wallpapers");
const PUBLIC_FILES_DIR = path.join(process.cwd(), "public", "files");
const ASSETS_WALLPAPERS_DIR = path.join(process.cwd(), "src", "assets", "wallpapers");
const MAX_WALLPAPER_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const checkOnly = process.argv.includes("--check");

function isSupportedWallpaperFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

  if (checkOnly) {
    return;
  }

  await rm(PUBLIC_FILES_DIR, { recursive: true, force: true });
  await rm(ASSETS_WALLPAPERS_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_FILES_DIR, { recursive: true });
  await mkdir(ASSETS_WALLPAPERS_DIR, { recursive: true });

  for (const fileName of wallpaperFiles) {
    const srcPath = path.join(ROOT_WALLPAPERS_DIR, fileName);
    await cp(srcPath, path.join(PUBLIC_FILES_DIR, fileName));
    await cp(srcPath, path.join(ASSETS_WALLPAPERS_DIR, fileName));
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
