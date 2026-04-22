import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBasePath = process.env.PAGES_BASE_PATH ?? "/";

export default defineConfig({
  base: pagesBasePath,
  plugins: [react()],
  server: {
    port: 4173
  }
});
