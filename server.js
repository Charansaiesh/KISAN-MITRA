const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth.routes');
const tokensRoutes = require('./src/routes/tokens.routes');
const adminRoutes = require('./src/routes/admin.routes');
const mandisRoutes = require('./src/routes/mandis.routes');
const communityRoutes = require('./src/routes/community.routes');
const feedbackRoutes = require('./src/routes/feedback.routes');
const schemesRoutes = require('./src/routes/schemes.routes');
const notificationsRoutes = require('./src/routes/notifications.routes');
const cropQualityRoutes = require('./src/routes/cropQuality.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API
app.use('/api/', apiLimiter);

// Serve Static Frontend Portals
app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, 'js')));

const fs = require('fs');
let cachedApiJs = '';
try {
  const apiPath = path.join(__dirname, 'js', 'api.js');
  if (fs.existsSync(apiPath)) {
    cachedApiJs = fs.readFileSync(apiPath, 'utf8');
  }
} catch (e) {
  console.warn('api.js read warning:', e);
}

app.get(['/js/api.js', '/api.js'], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  if (cachedApiJs) {
    return res.send(cachedApiJs);
  }
  const apiPath = path.join(__dirname, 'js', 'api.js');
  res.sendFile(apiPath);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'community.html'));
});

// 1. HEALTH CHECK ENDPOINT
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'OK',
    app: 'KisanMitra Unified Backend',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    database: 'Supabase PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. API ROUTES (Mount on both /api and root for serverless flexibility)
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/tokens`, tokensRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/mandis`, mandisRoutes);
  app.use(`${prefix}/community`, communityRoutes);
  app.use(`${prefix}/feedback`, feedbackRoutes);
  app.use(`${prefix}/notifications`, notificationsRoutes);
  app.use(`${prefix}/schemes`, schemesRoutes);
  app.use(`${prefix}/crop-quality`, cropQualityRoutes);
};
mountRoutes('/api');
mountRoutes('');

// Error Handling Middleware
app.use(errorHandler);

// Start HTTP Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌾 KisanMitra Backend running at http://localhost:${PORT}`);
    console.log(`🛡️ Admin Portal: http://localhost:${PORT}/admin.html`);
    console.log(`🌾 Farmer Portal: http://localhost:${PORT}/index.html`);
    console.log(`👥 Community Portal: http://localhost:${PORT}/community.html`);
  });
}

module.exports = app;
