const express = require('express');
const {
    getDashboardStats,
    getRecentActivity,
    getEnrollmentTrends
} = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/activity', authMiddleware, getRecentActivity);
router.get('/enrollment-trends', authMiddleware, getEnrollmentTrends);

module.exports = router;