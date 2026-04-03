const express = require('express');
const {
    getAllInstructors,
    getInstructorById,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorsByDepartment,
    searchInstructors
} = require('../controllers/instructorController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllInstructors);
router.get('/search', authMiddleware, searchInstructors);
router.get('/department/:deptId', authMiddleware, getInstructorsByDepartment);
router.get('/:id', authMiddleware, getInstructorById);
router.post('/', authMiddleware, requireRole('admin'), createInstructor);
router.put('/:id', authMiddleware, requireRole('admin'), updateInstructor);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteInstructor);

module.exports = router;