import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"],
    platform: "node",
    target: "node20",
    bundle: true,
    splitting: false,
    dts: true,
    external: [
        "dotenv",
        "fs",
        "path",
        "http",
        "https",
        "crypto",
        "events",
        "stream",
        "util",
        "url",
        "os",
        "buffer",
        "zlib",
        "tty",
        "net",
        "child_process",
        "onnxruntime-node",
        "sharp"
    ],
    esbuildOptions: (options) => {
        options.bundle = true;
        options.platform = 'node';
    }
});
