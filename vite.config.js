import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            return 'vendor';
          }
          
          // Create feature-based chunks
          if (id.includes('src/pages/Customers')) {
            return 'customers';
          }
          if (id.includes('src/pages/Transactions')) {
            return 'transactions';
          }
          if (id.includes('src/pages/Vendors')) {
            return 'vendors';
          }
          if (id.includes('src/pages/HajjUmrah')) {
            return 'hajj-umrah';
          }
          if (id.includes('src/pages/AirTicketing')) {
            return 'air-ticketing';
          }
          if (id.includes('src/pages/VisaProcessing')) {
            return 'visa-processing';
          }
          if (id.includes('src/pages/Loan')) {
            return 'loan';
          }
          if (id.includes('src/pages/MirajIndustries')) {
            return 'miraj-industries';
          }
          if (id.includes('src/pages/Account')) {
            return 'account';
          }
          if (id.includes('src/pages/Personal')) {
            return 'personal';
          }
          if (id.includes('src/pages/FlyOval')) {
            return 'fly-oval';
          }
          if (id.includes('src/pages/OfficeManagement')) {
            return 'office-management';
          }
          if (id.includes('src/pages/MoneyExchange')) {
            return 'money-exchange';
          }
          if (id.includes('src/pages/SalesInvoice')) {
            return 'sales-invoice';
          }
          if (id.includes('src/pages/Settings')) {
            return 'settings';
          }
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging in production
    sourcemap: true,
    // Optimize assets
    assetsInlineLimit: 4096
  },
  // Enable compression
  server: {
    compress: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ]
  }
})
