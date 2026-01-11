import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Proxy para Orion (Modo Camuflado de Python)
app.use(
  '/api/orion',
  createProxyMiddleware({
    target: 'https://payapi.orion.moe',
    changeOrigin: true,
    pathRewrite: { '^/api/orion': '' },
    secure: false,
    onProxyReq: (proxyReq) => {
      // 1. Força o User-Agent do Python que funcionou
      proxyReq.setHeader('User-Agent', 'python-requests/2.32.4');
      
      // 2. Garante que Content-Type seja JSON
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Accept', '*/*');

      // 3. Remove headers que entregam que é um navegador (Browser Fingerprinting)
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');
      proxyReq.removeHeader('sec-ch-ua');
      proxyReq.removeHeader('sec-ch-ua-mobile');
      proxyReq.removeHeader('sec-ch-ua-platform');
      proxyReq.removeHeader('sec-fetch-dest');
      proxyReq.removeHeader('sec-fetch-mode');
      proxyReq.removeHeader('sec-fetch-site');
      proxyReq.removeHeader('sec-fetch-user');
    },
  })
);

// 2. Proxy para Nominatim (Geolocalização)
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

// 3. Proxy para ViaCEP (Endereço)
app.use(
  '/api/viacep',
  createProxyMiddleware({
    target: 'https://viacep.com.br',
    changeOrigin: true,
    pathRewrite: { '^/api/viacep': '' },
    secure: false,
  })
);

// 4. Arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// 5. Fallback para SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});