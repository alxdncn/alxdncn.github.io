import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        lookingGlassUnity: resolve(__dirname, 'looking-glass-unity.html'),
        ect: resolve(__dirname, 'ect.html'),
        savagebeasts: resolve(__dirname, 'savagebeasts.html'),
        timeismoney: resolve(__dirname, 'timeismoney.html'),
        whenlionsspeak: resolve(__dirname, 'whenlionsspeak.html'),
        beyondFairUse: resolve(__dirname, 'beyond-fair-use/index.html'),
        beyondFairUseHtml: resolve(__dirname, 'beyond-fair-use.html'),
        gamesBitingBack: resolve(__dirname, 'games-biting-back.html'),
        cv: resolve(__dirname, 'CV.html'),
      },
    },
  },
})
