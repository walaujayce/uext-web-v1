import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        // Proxy for the first API
        '/api/7284': {
          target: 'http://192.9.120.70:7284',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/7284/, '/api'), // Rewrites '/api/device1' to '/api'
        },
        // Proxy for the second API
        '/api/8031': {
          target: 'http://192.9.120.70:8031',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/8031/, '/api/v1'), // Rewrites '/api/device2' to '/api/v1'
        },
        // Proxy for the thrid API
        '/api/7285': {
        target: 'http://192.9.120.70:7285', // Your API server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/7285/, '/api/v1'), // Rewrite '/api' to ''
      },
      },
},
})
