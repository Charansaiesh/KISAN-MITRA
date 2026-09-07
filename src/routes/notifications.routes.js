const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/', notificationsController.getNotifications);
router.post('/', optionalAuth, notificationsController.createNotification);
router.patch('/:id', optionalAuth, notificationsController.updateNotification);
router.put('/:id', optionalAuth, notificationsController.updateNotification);
router.delete('/:id', optionalAuth, notificationsController.deleteNotification);

module.exports = router;
