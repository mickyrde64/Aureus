
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    // Standard injection for Vercel environment variables
    EnvironmentPlugin({
      API_KEY: process.env.API_KEY || ''
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false
  },
  // Ensure we can use process.env in the client
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
