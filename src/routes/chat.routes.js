const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// 1. Post Chat Query
router.post('/', chatController.sendMessage);

// 2. Get Quick Smart Suggestions
router.get('/suggestions', chatController.getSuggestions);

module.exports = router;
