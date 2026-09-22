import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'madar-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            try {
              if (req.url && (req.url.startsWith('/api') || req.url === '/health' || req.url === '/ready')) {
                const { app } = await import('./server/_core/index.ts');
                app(req as any, res as any, next);
                return;
              }
            } catch (err) {
              console.error('API middleware error:', err);
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'three';
              if (id.includes('recharts')) return 'recharts';
              if (id.includes('@trpc') || id.includes('@tanstack')) return 'trpc';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
