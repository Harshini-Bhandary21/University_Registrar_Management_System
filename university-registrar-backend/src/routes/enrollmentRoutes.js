const express = require('express');
const {
    getAllEnrollments,
    enrollStudent,
    dropEnrollment,
    getStudentEnrollments,
    getAvailableCourses
} = require('../controllers/enrollmentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/all', getAllEnrollments);
router.get('/student/:studentId', getStudentEnrollments);
router.get('/available/:studentId', getAvailableCourses);
router.post('/', requireRole('admin'), enrollStudent);
router.delete('/', requireRole('admin'), dropEnrollment);

module.exports = router;