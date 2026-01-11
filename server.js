import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Proxy para Orion (Pagamento)
app.use(
  '/api/orion',
  createProxyMiddleware({
    target: 'https://payapi.orion.moe',
    changeOrigin: true,
    pathRewrite: { '^/api/orion': '' },
    secure: false,
    onProxyReq: (proxyReq) => {
      // Removemos Origin e Referer para tentar passar pelo bloqueio de CORS
      proxyReq.removeHeader('Origin');
      proxyReq.removeHeader('Referer');
      // REMOVIDO O USER-AGENT CONFORME SOLICITADO
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

// 3. NOVO: Proxy para ViaCEP (Endereço)
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

// 5. Fallback para SPA (Regex corrigido para evitar erro no Render)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});