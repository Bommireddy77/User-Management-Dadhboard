import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'User-Management-Dadhboard'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()]
})
