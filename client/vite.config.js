import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Express API will run on port 5000 later. This proxy lets the React app
// call "/api/..." without CORS problems during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
