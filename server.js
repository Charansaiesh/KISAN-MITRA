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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'KisanMitra Unified Backend',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    database: process.env.SUPABASE_URL ? 'Supabase PostgreSQL' : 'Memory Persistence (Fallback Active)',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mandis', mandisRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/schemes', schemesRoutes);

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
