import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }

  return Math.abs(a);
}

function titleFromFileName(fileName: string): string {
  const baseName = path.basename(fileName, path.extname(fileName));

  return baseName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function computeAspectRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0) return "0:0";

  const d = gcd(width, height);

  return `${width / d}:${height / d}`;
}

type Orientation = "landscape" | "portrait" | "square";

function computeOrientation(width: number, height: number): Orientation {
  if (width > height) return "landscape";
  if (height > width) return "portrait";

  return "square";
}

function computeDevices(aspectRatio: string, orientation: Orientation): string[] {
  const devices: string[] = [];

  if (orientation === "landscape" || orientation === "square") {
    devices.push("desktop");
  }

  if (orientation === "portrait") {
    devices.push("mobile");
  }

  if (aspectRatio === "4:3" || aspectRatio === "3:2") {
    devices.push("tablet");
  }

  return devices;
}

function extractExifArtist(exifBuffer: Buffer): string | undefined {
  if (exifBuffer.length < 14) return undefined;

  const isLittleEndian = exifBuffer[0] === 0x49;

  const readUint16 = (offset: number): number =>
    isLittleEndian ? exifBuffer.readUInt16LE(offset) : exifBuffer.readUInt16BE(offset);

  const readUint32 = (offset: number): number =>
    isLittleEndian ? exifBuffer.readUInt32LE(offset) : exifBuffer.readUInt32BE(offset);

  const ifd0Offset = readUint32(4);
  const numEntries = readUint16(ifd0Offset);

  const ARTIST_TAG = 0x013b;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifd0Offset + 2 + i * 12;
    const tag = readUint16(entryOffset);

    if (tag !== ARTIST_TAG) continue;

    const type = readUint16(entryOffset + 2);
    const count = readUint32(entryOffset + 4);

    if (type !== 2) return undefined;

    if (count <= 4) {
      return exifBuffer.toString("ascii", entryOffset + 8, entryOffset + 8 + count - 1);
    }

    const valueOffset = readUint32(entryOffset + 8);

    return exifBuffer.toString("ascii", valueOffset, valueOffset + count - 1);
  }

  return undefined;
}

interface LoaderStore {
  set(entry: { id: string; data: Record<string, unknown> }): void;
  clear(): void;
}

interface LoaderLogger {
  info(message: string): void;
}

export function wallpaperLoader() {
  return {
    name: "wallpapers",
    async load({ store, logger }: { store: LoaderStore; logger: LoaderLogger }) {
      store.clear();

      const wallpapersDir = path.join(process.cwd(), "wallpapers");
      const entries = await readdir(wallpapersDir, { withFileTypes: true });

      const files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => !name.startsWith("."))
        .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

      for (const fileName of files) {
        const filePath = path.join(wallpapersDir, fileName);
        const metadata = await sharp(filePath).metadata();

        const width = metadata.width ?? 0;
        const height = metadata.height ?? 0;

        const orientation = computeOrientation(width, height);
        const aspectRatio = computeAspectRatio(width, height);
        const devices = computeDevices(aspectRatio, orientation);
        const title = titleFromFileName(fileName);

        let creator: string | undefined;

        if (metadata.exif) {
          try {
            creator = extractExifArtist(metadata.exif);
          } catch {
            creator = undefined;
          }
        }

        store.set({
          id: fileName,
          data: {
            id: fileName,
            title,
            width,
            height,
            aspectRatio,
            orientation,
            devices,
            creator,
            fileName,
          },
        });
      }

      logger.info(`Loaded ${files.length} wallpapers`);
    },
  };
}
