import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,  // Disables the HMR error overlay
    },
    // Uncomment this line if you want to change the port
    // port: 3000,
  },
})
