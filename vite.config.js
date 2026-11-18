import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the build works on GitHub Pages (any repo name)
export default defineConfig({
  plugins: [react()],
  base: './',
})
