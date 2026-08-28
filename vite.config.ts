import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Surfaced in the UI so a shared score can be tied to the rules that produced
  // it - scoring changes would otherwise make old results incomparable.
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
