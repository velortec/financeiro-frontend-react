import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendBase = path.resolve(__dirname, '../../projeto reutilizavel/frontend-react');

export default defineConfig({
  cacheDir: '.vite-cache/integration',
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@base', replacement: path.join(frontendBase, 'src') },
      { find: '@', replacement: path.join(frontendBase, 'src') },
      { find: '@velortec/financeiro-react/styles.css', replacement: path.resolve(__dirname, 'dist/styles.css') },
      { find: '@velortec/financeiro-react', replacement: path.resolve(__dirname, 'dist/index.js') },
    ],
    dedupe: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  server: { fs: { allow: [__dirname, frontendBase] } },
  build: {
    outDir: 'dist-integration',
    emptyOutDir: true,
    rollupOptions: { input: path.resolve(__dirname, 'integration/frontend-base.html') },
  },
});
