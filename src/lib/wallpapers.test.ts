import { describe, expect, it } from "vitest";
import { isSupportedWallpaperFile, titleFromFileName, wallpaperUrl } from "./wallpapers";

describe("isSupportedWallpaperFile", () => {
  it("accepts common wallpaper image formats", () => {
    expect(isSupportedWallpaperFile("mountain.jpg")).toBe(true);
    expect(isSupportedWallpaperFile("mountain.JPEG")).toBe(true);
    expect(isSupportedWallpaperFile("mountain.png")).toBe(true);
    expect(isSupportedWallpaperFile("mountain.webp")).toBe(true);
    expect(isSupportedWallpaperFile("mountain.avif")).toBe(true);
  });

  it("rejects non-image files", () => {
    expect(isSupportedWallpaperFile("notes.txt")).toBe(false);
    expect(isSupportedWallpaperFile("archive.zip")).toBe(false);
  });
});

describe("titleFromFileName", () => {
  it("formats a readable title from a file name", () => {
    expect(titleFromFileName("blue-mountain_sunset.jpg")).toBe("Blue Mountain Sunset");
  });
});

describe("wallpaperUrl", () => {
  it("builds a GitHub Pages-safe file URL", () => {
    expect(wallpaperUrl("/wallpapers/", "blue mountain.jpg")).toBe(
      "/wallpapers/files/blue%20mountain.jpg"
    );
  });
});
