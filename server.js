import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de Log Geral (Para ver se a requisição chega no Node)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// 1. Proxy para Orion (Com Logs Detalhados)
app.use(
  '/api/orion',
  createProxyMiddleware({
    target: 'https://payapi.orion.moe',
    changeOrigin: true,
    pathRewrite: { '^/api/orion': '' },
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
      // --- LIMPEZA DE HEADERS (TENTATIVA DE ENGANAR O CORS) ---
      proxyReq.removeHeader('Origin');
      proxyReq.removeHeader('Referer');
      proxyReq.removeHeader('Cookie'); // Cookies as vezes bloqueiam
      
      // Remove headers que identificam o browser (Sec-*)
      // Navegadores modernos mandam isso e APIs antigas bloqueiam
      proxyReq.removeHeader('sec-ch-ua');
      proxyReq.removeHeader('sec-ch-ua-mobile');
      proxyReq.removeHeader('sec-ch-ua-platform');
      proxyReq.removeHeader('sec-fetch-dest');
      proxyReq.removeHeader('sec-fetch-mode');
      proxyReq.removeHeader('sec-fetch-site');
      proxyReq.removeHeader('sec-fetch-user');

      // Força headers de "Servidor para Servidor"
      proxyReq.setHeader('User-Agent', 'python-requests/2.32.4'); // Mimic Python
      proxyReq.setHeader('Accept', '*/*');
      proxyReq.setHeader('Content-Type', 'application/json');

      // --- LOGS DE DEBUG (APARECERÃO NO RENDER) ---
      console.log('--- [DEBUG PROXY ORION] ---');
      console.log('URL Original (React):', req.url);
      console.log('Caminho no Target:', proxyReq.path);
      console.log('HEADERS ENVIADOS PARA ORION:');
      console.log(proxyReq.getHeaders());
      console.log('-----------------------------');
    },
    onError: (err, req, res) => {
      console.error('--- [ERRO PROXY] ---', err);
      res.status(500).send('Proxy Error');
    }
  })
);

// 2. Proxy para Nominatim
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

// 3. Proxy para ViaCEP
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

// 5. Fallback SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});