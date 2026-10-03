import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development, "/api" calls go to the local server, so no CORS setup is needed.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
