import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  outDir: "./dist",
  target: "esnext",
  splitting: true,
  sourcemap: true,
  minify: true,
  clean: true,
});
