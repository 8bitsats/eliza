import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'esnext',
  platform: 'node',
  external: ['@elizaos/core'],
  onSuccess: 'pnpm run build:docs',
})
