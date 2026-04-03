const express = require('express');
const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamsByCourse
} = require('../controllers/examController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.get('/course/:courseNo', getExamsByCourse);
router.post('/', requireRole('admin'), createExam);
router.put('/:id', requireRole('admin'), updateExam);
router.delete('/:id', requireRole('admin'), deleteExam);

module.exports = router;