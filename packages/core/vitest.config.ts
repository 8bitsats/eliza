import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*"],
            exclude: ["src/**/*.d.ts", "src/**/*.test.ts"],
            statements: 80,
            branches: 70,
            functions: 80,
            lines: 80,
        },
        setupFiles: ["./vitest.setup.ts"],
        globals: true,
        watch: false,
        threads: true,
        isolate: true,
        clearMocks: true,
        restoreMocks: true,
        resetModules: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
