import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://abijith-suresh.github.io",
  base: "/wallpapers",
  trailingSlash: "always",
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },
});
