import path from "path";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import svga from "./src";

export default defineConfig({
  plugins: [svga()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "SVGA",
    },
    rollupOptions: {
      external: Object.keys(dependencies),
    },
    sourcemap: true,
  },
});
