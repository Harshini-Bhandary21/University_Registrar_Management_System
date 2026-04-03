const express = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByDepartment,
    addPrerequisite
} = require('../controllers/courseController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllCourses);
router.get('/department/:deptId', authMiddleware, getCoursesByDepartment);
router.get('/:id', authMiddleware, getCourseById);

router.post('/', authMiddleware, requireRole('admin'), createCourse);
router.post('/:courseNo/prerequisite', authMiddleware, requireRole('admin'), addPrerequisite);
router.put('/:id', authMiddleware, requireRole('admin'), updateCourse);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCourse);

module.exports = router;