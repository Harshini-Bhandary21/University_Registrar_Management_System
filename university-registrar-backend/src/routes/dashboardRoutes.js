const express = require('express');
const {
    getDashboardStats,
    getRecentActivity,
    getEnrollmentTrends
} = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/enrollment-trends', getEnrollmentTrends);

module.exports = router;