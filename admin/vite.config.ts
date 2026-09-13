import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the KindLink backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Uploaded avatars are served by the backend as static files
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
