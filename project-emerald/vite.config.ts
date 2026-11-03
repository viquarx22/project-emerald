import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Heavy 3D code is isolated in its own chunks so the DOM interface paints first
// and the WebGL world streams in behind the loading sequence.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Everything that only the 3D world needs. (react-dom's scheduler and zustand stay in the main bundle.)
          if (/node_modules\/(three|three-stdlib|postprocessing|@react-three|maath|troika-[^/]+|meshline|camera-controls|detect-gpu|stats-gl|suspend-react|its-fine|react-reconciler)\//.test(id)) {
            return 'three'
          }
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)/.test(id)) return 'motion'
          return undefined
        },
      },
    },
  },
  server: { host: true },
})
