import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiV1ProxyTarget = process.env.VITE_API_V1_PROXY_TARGET || 'http://localhost:8081';
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/subjects': path.resolve(__dirname, './src/pages/subjects'),
      '@/api': path.resolve(__dirname, './src/pages/subjects/discrete-math/api'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1': {
        target: apiV1ProxyTarget,
        changeOrigin: true,
      },
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
