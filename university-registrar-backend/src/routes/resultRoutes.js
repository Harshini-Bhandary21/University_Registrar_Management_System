const express = require('express');
const {
    addOrUpdateResult,
    getStudentResults,
    getExamResults,
    getAllResults,
    deleteResult,
    bulkUploadResults
} = require('../controllers/resultController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/student/:studentId', getStudentResults);
router.get('/exam/:examId', getExamResults);
router.get('/all', getAllResults);
router.post('/', requireRole('admin'), addOrUpdateResult);
router.post('/bulk', requireRole('admin'), bulkUploadResults);
router.delete('/:id', requireRole('admin'), deleteResult);

module.exports = router;