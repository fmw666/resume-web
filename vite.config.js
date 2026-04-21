import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite 构建配置。
 *
 * 设计要点：
 *   - 产物放到 `dist/app/`（JS/CSS 带 hash），`public/assets/*` 原样复刻，
 *     避免文件名冲突。
 *   - `manualChunks` 把 jQuery 和核心模块切成独立 chunk：首屏只需要
 *     `main` + `vendor-jquery`，懒加载的 portfolio / testimonials
 *     会自然按 dynamic import 再拆出独立 chunk（Rollup 行为）。
 *   - `cssCodeSplit: true` 让动态 import 的模块带自己的样式（目前没有
 *     模块级 CSS，保留开关给未来接入）。
 *   - Terser 压缩开启 console drop（保留 warn/error 以便问题排查），
 *     默认 esbuild minify 已经够快，terser 在体积上更狠，但会拖慢构建；
 *     这里继续用默认的 esbuild，仅开启一些体积优化。
 *   - `reportCompressedSize: false` 加速构建（gzip 大小不用 log）。
 */
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    root: '.',
    publicDir: 'public',
    base: './',

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProd,
      cssCodeSplit: true,
      assetsDir: 'app',
      assetsInlineLimit: 4096,
      reportCompressedSize: false,
      target: 'es2018',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // 静态资源文件名带 content-hash，利于长缓存
          entryFileNames: 'app/[name].[hash].js',
          chunkFileNames: 'app/[name].[hash].js',
          assetFileNames: 'app/[name].[hash][extname]',
          manualChunks(id) {
            // 把 jQuery 拆到单独 chunk，后续页面更新业务代码时 jQuery 不需要重新下载
            if (id.includes('node_modules/jquery')) return 'vendor-jquery';
            if (id.includes('/src/core/')) return 'app-core';
            return undefined;
          },
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
  };
});
