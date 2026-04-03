const express = require('express');
const {
    enrollStudent,
    getStudentEnrollments,
    getCourseEnrollments,
    dropEnrollment
} = require('../controllers/enrollmentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/student/:studentId', authMiddleware, getStudentEnrollments);
router.get('/course/:courseNo/:year/:semester/:section', authMiddleware, getCourseEnrollments);

router.post('/', authMiddleware, enrollStudent);
router.delete('/', authMiddleware, requireRole('admin'), dropEnrollment);

module.exports = router;