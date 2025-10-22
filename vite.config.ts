import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - highest priority
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-core';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'ui-components';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Admin pages
          if (id.includes('/pages/') && (id.includes('Admin') || id.includes('Bulk') || id.includes('Migration'))) {
            return 'admin-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
}));
