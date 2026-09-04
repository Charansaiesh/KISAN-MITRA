const express = require('express');
const router = express.Router();
const tokensController = require('../controllers/tokens.controller');
const { authenticateJWT, requireRole, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, tokensController.createToken);
router.get('/', tokensController.getAllTokens);
router.get('/:token', tokensController.getToken);
router.patch('/:token/advance', authenticateJWT, requireRole('officer', 'admin'), tokensController.advanceStep);
router.delete('/:token', authenticateJWT, requireRole('officer', 'admin'), tokensController.deleteToken);
router.post('/reset-demo', authenticateJWT, requireRole('officer', 'admin'), tokensController.resetDemoData);

module.exports = router;
