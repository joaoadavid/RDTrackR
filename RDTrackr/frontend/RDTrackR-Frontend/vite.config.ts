import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.tsx",

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: path.resolve(__dirname, "./coverage"),

      // 👇 IGNORA TUDO DA PASTA generated
      exclude: [
        "src/generated/**",
        "generated/**",
        "**/generated/**",
        "**/*.d.ts", // opcional
        "node_modules/**",
        "dist/**",
      ],
    },
  },
}));
