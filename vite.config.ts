import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy existente para Orion (Pagamento)
      '/api/orion': {
        target: 'https://payapi.orion.moe',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/orion/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
          });
        },
      },
      // NOVO PROXY: OpenStreetMap (Geolocalização)
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove origem para evitar bloqueio
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            // Nominatim exige User-Agent válido
            proxyReq.setHeader('User-Agent', 'SmashFastApp/1.0');
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));