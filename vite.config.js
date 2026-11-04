import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Self-contained relative paths: HTML and assets can reside in any single folder
  plugins: [react()],
  build: {
    sourcemap: false, // Security: Never leak source maps or raw source code in production
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4KB to save network roundtrips
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'particles-vendor': ['@tsparticles/react', '@tsparticles/slim'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
