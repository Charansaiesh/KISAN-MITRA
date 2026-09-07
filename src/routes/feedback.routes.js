const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const notificationsController = require('../controllers/notifications.controller');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedback);

// Notifications & Announcements CRUD
router.get('/notifications', notificationsController.getNotifications);
router.post('/notifications', optionalAuth, notificationsController.createNotification);
router.patch('/notifications/:id', optionalAuth, notificationsController.updateNotification);
router.put('/notifications/:id', optionalAuth, notificationsController.updateNotification);
router.delete('/notifications/:id', optionalAuth, notificationsController.deleteNotification);

module.exports = router;
