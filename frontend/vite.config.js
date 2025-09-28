import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // The main IDE entry point
        main: resolve(__dirname, 'index.html'),
        // The new, dedicated entry point for the CLI runner
        'cli-renderer': resolve(__dirname, 'src/cli-main.jsx'),
      },
      output: {
        // Ensure the output file for the cli-renderer has a predictable name
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'cli-renderer' ? 'assets/cli-renderer.js' : 'assets/[name]-[hash].js';
        }
      }
    }
  }
})