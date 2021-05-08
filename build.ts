import { build } from "esbuild";
import pkg from "./package.json";

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  external: Object.keys(pkg.dependencies),
  outfile: pkg.main,
  minify: true,
  sourcemap: true,
});

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  external: Object.keys(pkg.dependencies),
  outfile: pkg.module,
  minify: true,
  sourcemap: true,
});
