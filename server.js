import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler JSON do corpo da requisição (IMPORTANTE)
app.use(express.json());

// LOG GERAL
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// --- ROTA DE PAGAMENTO MANUAL (SEM PROXY MIDDLEWARE) ---
// O React chama isso, e o Node chama a Orion. Sem vazamento de headers.
app.post('/api/backend/pix', async (req, res) => {
  try {
    const payload = req.body;
    const apiKey = "opay_1c67aaf9edc1084d163f27e0f07d441fb1e8d49ba8bfc1971a71683880f37979"; //process.env.VITE_ORION_API_KEY; // O Render injeta isso

    console.log('--- [BACKEND] Iniciando pagamento manual ---');
    console.log('Payload recebido:', payload);

    // Chamada Server-to-Server (Igual ao Python)
    const orionResponse = await fetch('https://payapi.orion.moe/api/v1/pix/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'python-requests/2.32.4', // Camuflagem
        'X-API-Key': apiKey || '', // Passa a chave se necessário no header ou body
        // Note: Não enviamos Origin nem Referer aqui. É uma chamada limpa.
      },
      body: JSON.stringify(payload)
    });

    const responseText = await orionResponse.text();
    console.log('[BACKEND] Status Orion:', orionResponse.status);
    console.log('[BACKEND] Resposta Orion:', responseText);

    // Tenta parsear JSON
    try {
      const data = JSON.parse(responseText);
      // Repassa o status e o JSON para o React
      res.status(orionResponse.status).json(data);
    } catch (e) {
      res.status(orionResponse.status).send(responseText);
    }

  } catch (error) {
    console.error('[BACKEND] Erro Fatal:', error);
    res.status(500).json({ error: 'Erro interno no servidor Node', details: error.message });
  }
});

// --- ROTA DE STATUS MANUAL ---
app.get('/api/backend/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // const apiKey = process.env.VITE_ORION_API_KEY; 

    const response = await fetch(`https://payapi.orion.moe/api/v1/pix/status/${id}`, { // Ajuste a URL se necessário
       method: 'GET',
       headers: {
         'User-Agent': 'python-requests/2.32.4',
         'Content-Type': 'application/json'
       }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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