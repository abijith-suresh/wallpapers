import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { wallpaperLoader } from "./loaders/wallpapers";

const wallpapers = defineCollection({
  loader: wallpaperLoader(),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    width: z.number(),
    height: z.number(),
    aspectRatio: z.string(),
    orientation: z.enum(["landscape", "portrait", "square"]),
    devices: z.array(z.enum(["desktop", "mobile", "tablet"])),
    creator: z.string().optional(),
    fileName: z.string(),
  }),
});

export const collections = { wallpapers };
