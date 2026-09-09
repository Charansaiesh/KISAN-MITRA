const express = require('express');
const router = express.Router();
const mandisController = require('../controllers/mandis.controller');

router.get('/', mandisController.getMandis);
router.get('/prices', mandisController.getPrices);
router.post('/arbitrage-calculator', mandisController.calculateMandiArbitrage);
router.get('/arbitrage-options', mandisController.getArbitrageOptions);

module.exports = router;
