const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Summary for quick metrics
router.get('/summary', analyticsController.getSummary);

// Full JSON payload
router.get('/full', analyticsController.getFullAnalytics);

// Direct chart PNG serving
router.get('/charts/:name', analyticsController.getChartImage);

// DB Views fast statistics
router.get('/db-views', analyticsController.getDatabaseViewStats);

// Trigger refresh (Admin only)
router.post('/refresh', authenticateToken, authorizeRoles('ADMIN'), analyticsController.refreshAnalytics);

module.exports = router;
