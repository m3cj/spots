import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // Used only when VITE_API_BASE_URL is empty; keeps the httpOnly auth cookies first-party.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes least often, longest cache lifetime.
          'vendor-react': ['react', 'react-dom'],
          // Router is loaded on every page but changes independently of react core.
          'vendor-router': ['react-router-dom'],
          // Motion is large; split so it doesn't block non-animated pages.
          'vendor-motion': ['motion', 'motion/react'],
          // Maps SDK — only loaded on the Map page in practice.
          'vendor-maps': ['@vis.gl/react-google-maps'],
          // Icons — large but tree-shakeable; separate chunk avoids blocking other vendors.
          'vendor-icons': ['react-icons'],
        },
      },
    },
  },
});

