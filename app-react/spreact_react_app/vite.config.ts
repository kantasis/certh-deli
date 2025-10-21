import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
base: '/assets/',
  server: {
    host: '0.0.0.0',     // listen on all interfaces inside the container
    port: 5173,          // Vite's internal port
    hmr: {
      overlay: false,    // keeps your setting: disables HMR error overlay
    },
    // Uncomment this line if you want to change the port
    // port: 3000,
  },
})
