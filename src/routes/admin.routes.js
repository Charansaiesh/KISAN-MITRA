const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.get('/stats', authenticateJWT, requireRole('officer', 'admin'), adminController.getStats);

module.exports = router;
