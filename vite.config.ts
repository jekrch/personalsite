import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import seo from './seo'

export default defineConfig({
  base: './',
  plugins: [react(), seo()],
})
