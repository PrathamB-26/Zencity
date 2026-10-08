const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, notificationController.listNotifications);
router.patch('/read', authenticateToken, notificationController.markAsRead);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

module.exports = router;
