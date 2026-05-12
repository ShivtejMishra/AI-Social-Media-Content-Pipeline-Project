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
        manualChunks: {
          // Core React — rarely changes, cached aggressively
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Data layer
          'query-vendor': ['@tanstack/react-query'],
          // UI utilities
          'ui-vendor': ['lucide-react', 'sonner', 'date-fns'],
          // Calendar is heavy — isolate it
          'calendar-vendor': ['react-big-calendar'],
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
