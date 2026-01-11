// server.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configura o Proxy para a Orion (Copia do que fizemos no Vite)
app.use(
  '/api/orion',
  createProxyMiddleware({
    target: 'https://payapi.orion.moe',
    changeOrigin: true,
    pathRewrite: { '^/api/orion': '' },
    secure: false,
    onProxyReq: (proxyReq) => {
      // O Pulo do Gato para o CORS em produção
      proxyReq.removeHeader('Origin');
      proxyReq.removeHeader('Referer');
      // Adicionar User-Agent genérico por segurança
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    },
  })
);

// 2. Configura o Proxy para o Nominatim (Geolocalização)
app.use(
  '/api/nominatim',
  createProxyMiddleware({
    target: 'https://nominatim.openstreetmap.org',
    changeOrigin: true,
    pathRewrite: { '^/api/nominatim': '' },
    secure: false,
    onProxyReq: (proxyReq) => {
      proxyReq.removeHeader('Origin');
      proxyReq.removeHeader('Referer');
      proxyReq.setHeader('User-Agent', 'SmashFastApp/1.0');
    },
  })
);

// 3. Serve os arquivos estáticos do React (pasta dist)
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Redireciona qualquer outra rota para o index.html (para o React Router funcionar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});