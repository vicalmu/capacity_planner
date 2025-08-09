import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true, // Forzar el uso del puerto 3000
    open: true,
    host: 'localhost'
  },
  root: process.cwd(),
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gantt: resolve(__dirname, 'gantt.html'),
        simulator: resolve(__dirname, 'simulator.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@css': resolve(__dirname, './css'),
      '@js': resolve(__dirname, './js')
    }
  }
})