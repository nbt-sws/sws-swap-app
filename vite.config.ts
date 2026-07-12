import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const segments = id.toString().split('node_modules/')[1]?.split('/');
            if (!segments) return;
            const pkg = segments[0].startsWith('@')
              ? `${segments[0]}/${segments[1]}`
              : segments[0];

            if (['react', 'react-dom'].includes(pkg)) return 'vendor-react';
            if (pkg.startsWith('@radix-ui') || pkg.startsWith('@floating-ui')) return 'vendor-ui';
            if (pkg === 'framer-motion' || pkg.startsWith('motion-')) return 'vendor-motion';
            if (pkg === 'recharts' || pkg.startsWith('d3-')) return 'vendor-charts';
            if (pkg.startsWith('@tanstack')) return 'vendor-tanstack';
            if (pkg === 'lucide-react') return 'vendor-icons';
            if (['i18next', 'react-i18next', 'i18next-browser-languagedetector'].includes(pkg)) return 'vendor-i18n';
            if (['lodash', 'lodash-es', 'tailwind-merge', 'ky'].includes(pkg)) return 'vendor-utils';
          }
        },
      },
    },
  },
});
