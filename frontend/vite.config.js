import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the backend during dev so the frontend can just
    // call fetch('/api/...') without hardcoding http://localhost:5000.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
