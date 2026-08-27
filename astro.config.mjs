// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://marsbot.dev",
  vite: {
    plugins: [tailwindcss()],
    cacheDir: "/tmp/vite-marsbot-cache",
  },
});
