// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly define environment variable prefix
  envPrefix: 'VITE_',
  build: {
    // Increase chunk size warning limit (optional, but we'll optimize chunks)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunking strategy for better code splitting
        manualChunks: (id) => {
          // Vendor chunks - split large libraries
          if (id.includes('node_modules')) {
            // React and React DOM together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // React Slick (carousel)
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'slick-vendor';
            }
            // AOS (animations)
            if (id.includes('aos')) {
              return 'aos-vendor';
            }
            // React Simple Maps
            if (id.includes('react-simple-maps')) {
              return 'maps-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('yup') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            // Toast and UI libraries
            if (id.includes('react-toastify') || id.includes('react-tooltip')) {
              return 'ui-vendor';
            }
            // Axios
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // DOMPurify
            if (id.includes('dompurify')) {
              return 'dompurify-vendor';
            }
            // React Icons
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
        },
      },
    },
  },
})