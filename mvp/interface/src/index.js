const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const routes = require('./routes');
const okxDexService = require('./okx-dex-service');
require('dotenv').config();

// Create Express application
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://www.okx.com", "https://*.okx.com"],
    },
  },
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AgreeX API - OKX DEX Integration',
    version: '1.0.0',
    blockchain: 'Multi-chain (EVM)',
    dex: 'OKX DEX Aggregator v5',
    supportedChains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'BSC']
  });
});

// Routes
app.use('/api/v1', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle OKX API errors
  if (err.code === 'OKX_API_ERROR') {
    return res.status(err.status || 400).json({
      error: 'OKX DEX API Error',
      message: err.message,
      code: err.okxCode
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
async function startServer() {
  try {
    // Initialize OKX DEX service
    await okxDexService.initialize();
    
    app.listen(port, () => {
      console.log(`🚀 AgreeX API Server running on http://localhost:${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 OKX DEX Integration: Enabled`);
      console.log(`⛓️  Supported chains: ETH, MATIC, ARB, OP, AVAX, BSC`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await okxDexService.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await okxDexService.cleanup();
  process.exit(0);
});

startServer();
