import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { cloudflare } from '@cloudflare/vite-plugin'; // <--- IS THIS LINE HERE?

export default defineConfig({
  plugins: [react()], // If you see cloudflare() here, delete it!
});