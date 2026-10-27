const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Ensure JWT_SECRET is available in production serverless environments if not set in dashboard
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not configured. Falling back to runtime fallback secret.');
  process.env.JWT_SECRET = 'kisanmitra_jwt_secret_dev_key_2025_secure_983274293';
}

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
const chatRoutes = require('./src/routes/chat.routes');
const weatherRoutes = require('./src/routes/weather.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate limiter for API
app.use('/api/', apiLimiter);

// Serve Static Frontend Portals
app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, 'js')));

const fs = require('fs');

app.get(['/js/api.js', '/api.js'], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'js', 'api.js'));
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
const { AIChatService } = require('./src/services/AIChatService');

app.get(['/api/ai/status', '/ai/status'], (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  res.json({
    success: true,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    key_present: Boolean(apiKey && apiKey.length > 0),
    last_successful_call_time: AIChatService.getLastSuccessfulCallTime() || null
  });
});

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
  app.use(`${prefix}/chat`, chatRoutes);
  app.use(`${prefix}/weather`, weatherRoutes);
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
