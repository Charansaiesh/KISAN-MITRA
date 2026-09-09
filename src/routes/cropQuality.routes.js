const express = require('express');
const router = express.Router();
const cropQualityController = require('../controllers/cropQuality.controller');
const { authenticateJWT, optionalAuth, requireRole } = require('../middleware/auth');

// 1. Analyze Produce Image (Optional auth: if farmer logged in, links to their account)
router.post('/analyze', optionalAuth, cropQualityController.analyzeCropQuality);

// 2. Farmer's Assessment History (Authenticated farmer only)
router.get('/history', authenticateJWT, cropQualityController.getFarmerHistory);

// 3. Admin Aggregate Analytics (Officer/Admin only)
router.get('/analytics', authenticateJWT, requireRole('officer', 'admin'), cropQualityController.getAggregateAnalytics);

// 4. Public Technical Model Status & Limitations
router.get('/model-status', cropQualityController.getModelStatus);

module.exports = router;
