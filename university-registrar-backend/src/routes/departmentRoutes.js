const express = require('express');
const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllDepartments);
router.get('/:id', authMiddleware, getDepartmentById);
router.post('/', authMiddleware, requireRole('admin'), createDepartment);
router.put('/:id', authMiddleware, requireRole('admin'), updateDepartment);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteDepartment);

module.exports = router;