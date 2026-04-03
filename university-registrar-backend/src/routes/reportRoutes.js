const express = require('express');
const {
    generateStudentReport,
    generateDepartmentReport,
    globalSearch,
    getProgramStatistics,
    getGradeDistribution
} = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/student/:studentId', authMiddleware, generateStudentReport);
router.get('/department/:deptId', authMiddleware, generateDepartmentReport);
router.get('/search', authMiddleware, globalSearch);
router.get('/statistics/programs', authMiddleware, getProgramStatistics);
router.get('/statistics/grades', authMiddleware, getGradeDistribution);

module.exports = router;