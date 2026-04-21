import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    // 把 Vite 打包出的 JS/CSS 放到独立目录，避免和 public/assets 冲突
    assetsDir: 'app',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  server: {
    port: 5173,
    open: false,
    host: true,
  },

  preview: {
    port: 4173,
  },
});
