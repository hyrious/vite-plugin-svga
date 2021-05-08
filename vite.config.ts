import { defineConfig } from "vite";
import svga from "./src";

export default defineConfig({
  plugins: [svga()],
});
