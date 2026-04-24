import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import sitemap from "vite-plugin-sitemap";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    sitemap({
      hostname: "https://www.valdyerreshandball.fr",
      dynamicRoutes: [
        "/",
        "/club",
        "/collectifs",
        "/inscriptions",
        "/partenaires",
        "/contact",
      ],
    }),
  ],
  build: {
    target: ["es2015", "chrome73"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
