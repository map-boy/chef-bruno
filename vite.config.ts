import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Detect which build target via APP_BUILD env var
  // npm run build      → web  (src/       → dist/)
  // npm run build:app  → app  (src-app/   → dist-app/)
  const isAppBuild = process.env.APP_BUILD === 'true';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    root: '.',
    // App build uses index-app.html as entry point
    ...(isAppBuild && {
      build: {
        rollupOptions: {
          input: { index: path.resolve(__dirname, 'index-app.html') },
          output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        },
        outDir: 'dist-app',
        emptyOutDir: true,
      },
    }),
    // Web build uses default index.html → dist/
    ...(!isAppBuild && {
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    }),
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});