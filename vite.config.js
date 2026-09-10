import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` permite publicar en GitHub Pages bajo /<repositorio>/ sin tocar el código.
// En local y en Vercel/Netlify queda en "/".
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/juego/**"],
    },
  },
});
