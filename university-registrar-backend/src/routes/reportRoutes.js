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

router.use(authMiddleware);
router.get('/student/:studentId', generateStudentReport);
router.get('/department/:deptId', generateDepartmentReport);
router.get('/search', globalSearch);
router.get('/statistics/programs', getProgramStatistics);
router.get('/statistics/grades', getGradeDistribution);

module.exports = router;