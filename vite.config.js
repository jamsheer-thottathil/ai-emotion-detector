import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'ai-emotion-detector' with your repo name
export default defineConfig({
  base: '/ai-emotion-detector/',
  plugins: [react()],
})
