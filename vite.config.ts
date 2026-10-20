import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  cacheDir: '.vite-cache',
  plugins: [react()],
  optimizeDeps: { entries: ['integration/index.html'] },
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-router-dom', '@tanstack/react-query'],
      output: { assetFileNames: (asset) => asset.name === 'style.css' ? 'styles.css' : 'assets/[name]-[hash][extname]' },
    },
  },
});
