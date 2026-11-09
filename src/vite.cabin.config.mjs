import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [viteSingleFile()],
  build: { outDir: 'dist-cabin', emptyOutDir: true, target: 'es2022', modulePreload: false, assetsInlineLimit: 100000000,
    rollupOptions: { input: 'cabin.html', output: { format: 'iife', inlineDynamicImports: true } } },
});
