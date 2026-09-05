const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const notificationsController = require('../controllers/notifications.controller');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/notifications', notificationsController.getNotifications);

module.exports = router;
