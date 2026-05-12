import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@tanstack')) return 'query-vendor';
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('date-fns')) return 'ui-vendor';
            if (id.includes('react-big-calendar')) return 'calendar-vendor';
          }
        },
      },
    },
    // Reduce chunk sizes
    chunkSizeWarningLimit: 600,
    // Minify CSS
    cssMinify: true,
    // Target modern browsers — smaller output
    target: 'es2020',
  },
});
