import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        about: resolve(__dirname, 'about.html'),
        ect: resolve(__dirname, 'ect.html'),
        savagebeasts: resolve(__dirname, 'savagebeasts.html'),
        timeismoney: resolve(__dirname, 'timeismoney.html'),
        whenlionsspeak: resolve(__dirname, 'whenlionsspeak.html'),
        writing: resolve(__dirname, 'writing.html'),
        cv: resolve(__dirname, 'CV.html'),
      },
    },
  },
})
