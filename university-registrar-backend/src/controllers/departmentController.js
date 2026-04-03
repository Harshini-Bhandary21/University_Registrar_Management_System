const db = require('../config/db');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                d.dept_id,
                d.dept_name,
                (SELECT COUNT(*) FROM COURSE WHERE dept_id = d.dept_id) as course_count,
                (SELECT COUNT(*) FROM INSTRUCTOR WHERE dept_id = d.dept_id) as instructor_count
            FROM DEPARTMENT d
            ORDER BY d.dept_id
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving departments',
            error: error.message
        });
    }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                d.dept_id,
                d.dept_name,
                (SELECT COUNT(*) FROM COURSE WHERE dept_id = d.dept_id) as course_count,
                (SELECT COUNT(*) FROM INSTRUCTOR WHERE dept_id = d.dept_id) as instructor_count
            FROM DEPARTMENT d
            WHERE d.dept_id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Get courses in department
        const [courses] = await db.pool.query(`
            SELECT course_no, title, credits
            FROM COURSE
            WHERE dept_id = ?
            ORDER BY course_no
        `, [id]);
        
        // Get instructors in department
        const [instructors] = await db.pool.query(`
            SELECT i.instructor_id, p.first_name, p.last_name, i.title
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            WHERE i.dept_id = ?
            ORDER BY i.instructor_id
        `, [id]);
        
        res.json({
            success: true,
            data: {
                department: rows[0],
                courses: courses,
                instructors: instructors
            }
        });
    } catch (error) {
        console.error('Error getting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving department details',
            error: error.message
        });
    }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
    try {
        const { dept_name } = req.body;
        
        if (!dept_name) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }
        
        // Check if department exists
        const [existing] = await db.pool.query(
            'SELECT dept_id FROM DEPARTMENT WHERE dept_name = ?',
            [dept_name]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Department already exists'
            });
        }
        
        const [result] = await db.pool.query(
            'INSERT INTO DEPARTMENT (dept_name) VALUES (?)',
            [dept_name]
        );
        
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: { dept_id: result.insertId, dept_name }
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dept_name } = req.body;
        
        const [result] = await db.pool.query(
            'UPDATE DEPARTMENT SET dept_name = ? WHERE dept_id = ?',
            [dept_name, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Department updated successfully'
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.pool.query('DELETE FROM DEPARTMENT WHERE dept_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};