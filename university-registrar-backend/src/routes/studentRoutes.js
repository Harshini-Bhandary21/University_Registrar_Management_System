const express = require('express');
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    filterStudentsByProgram,
    searchStudents,
    getStudentsPaginated
} = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes (with auth)
router.get('/', authMiddleware, getAllStudents);
router.get('/paginated', authMiddleware, getStudentsPaginated);
router.get('/search', authMiddleware, searchStudents);
router.get('/filter/:programId', authMiddleware, filterStudentsByProgram);
router.get('/:id', authMiddleware, getStudentById);

// Admin only routes
router.post('/', authMiddleware, requireRole('admin'), createStudent);
router.put('/:id', authMiddleware, requireRole('admin'), updateStudent);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteStudent);

module.exports = router;