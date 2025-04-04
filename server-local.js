const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Proxy all API requests to the Vercel-deployed backend
app.use('/api', createProxyMiddleware({
  target: 'https://nurachain-backend-7gcwzio73-yuvrajjangirs-projects.vercel.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

// Serve static files for the frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Local server running on port ${PORT}`);
  console.log(`Proxying API requests to: https://nurachain-backend-7gcwzio73-yuvrajjangirs-projects.vercel.app`);
});
