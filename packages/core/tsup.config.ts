import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
<<<<<<< HEAD
    format: ["esm"], // Ensure you're targeting CommonJS
    platform: "node",
    target: "node18",
    bundle: true,
    splitting: true, // Add this for better code splitting
    dts: true, // Generate declaration files
=======
    format: ["esm"],
    bundle: true,
    splitting: false,
    dts: true,
>>>>>>> 3044b4d754ff7e77fa992254ba5c915612fb9425
    external: [
        "dotenv",
        "fs",
        "path",
        "http",
        "https",
<<<<<<< HEAD
        // Add other modules you want to externalize
        "onnxruntime-node",
        "sharp",
=======
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
        "child_process"
>>>>>>> 3044b4d754ff7e77fa992254ba5c915612fb9425
    ],
    esbuildOptions: (options) => {
        options.bundle = true;
        options.platform = 'node';
    }
});
