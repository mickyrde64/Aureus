
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
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
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
