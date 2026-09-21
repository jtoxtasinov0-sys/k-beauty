import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mini App va API bitta manzildan ochiladi — shuning uchun ngrok'da
// mixed-content va CORS muammosi bo'lmaydi.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // ngrok domenlari uchun
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
