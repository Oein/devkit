import { build } from "bun";
import { rmSync, existsSync } from "fs";
import { join } from "path";

// Clean dist directory
const distDir = join(import.meta.dir, "dist");
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

// Build the library
await build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  splitting: false,
  sourcemap: "external",
  external: [
    // Add any external dependencies here that shouldn't be bundled
    "axios",
  ],
});

console.log("✓ Build completed successfully!");
