const db = require('../config/db');

// @desc    Get all instructors
// @route   GET /api/instructors
// @access  Private
const getAllInstructors = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                i.instructor_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                i.title,
                i.dept_id,
                d.dept_name
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            JOIN DEPARTMENT d ON i.dept_id = d.dept_id
            ORDER BY i.instructor_id
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving instructors',
            error: error.message
        });
    }
};

// @desc    Get instructor by ID
// @route   GET /api/instructors/:id
// @access  Private
const getInstructorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                i.instructor_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                i.title,
                i.dept_id,
                d.dept_name,
                (SELECT GROUP_CONCAT(contact_no) FROM CONTACT WHERE instructor_id = i.instructor_id) as contacts
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            JOIN DEPARTMENT d ON i.dept_id = d.dept_id
            WHERE i.instructor_id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }
        
        // Get courses taught
        const [courses] = await db.pool.query(`
            SELECT 
                t.course_no,
                c.title,
                c.credits,
                t.year,
                t.semester_no,
                t.section_no
            FROM TEACHES t
            JOIN COURSE c ON t.course_no = c.course_no
            WHERE t.instructor_id = ?
            ORDER BY t.year DESC, t.semester_no DESC
        `, [id]);
        
        res.json({
            success: true,
            data: {
                instructor: rows[0],
                coursesTaught: courses
            }
        });
    } catch (error) {
        console.error('Error getting instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving instructor details',
            error: error.message
        });
    }
};

// @desc    Create new instructor
// @route   POST /api/instructors
// @access  Private (Admin only)
const createInstructor = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { first_name, middle_name, last_name, title, dept_id, contact_no } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !title || !dept_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Insert into PERSON
        const [personResult] = await connection.query(
            'INSERT INTO PERSON (first_name, middle_name, last_name) VALUES (?, ?, ?)',
            [first_name, middle_name || null, last_name]
        );
        
        const person_id = personResult.insertId;
        
        // Insert into INSTRUCTOR
        const [instructorResult] = await connection.query(
            'INSERT INTO INSTRUCTOR (person_id, title, dept_id) VALUES (?, ?, ?)',
            [person_id, title, dept_id]
        );
        
        const instructor_id = instructorResult.insertId;
        
        // Insert contact if provided
        if (contact_no) {
            await connection.query(
                'INSERT INTO CONTACT (instructor_id, contact_no, contact_type) VALUES (?, ?, ?)',
                [instructor_id, contact_no, 'Mobile']
            );
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: { instructor_id, person_id }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating instructor',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Update instructor
// @route   PUT /api/instructors/:id
// @access  Private (Admin only)
const updateInstructor = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { first_name, middle_name, last_name, title, dept_id } = req.body;
        
        // Check if instructor exists
        const [existing] = await connection.query(
            'SELECT person_id FROM INSTRUCTOR WHERE instructor_id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }
        
        const person_id = existing[0].person_id;
        
        // Update PERSON
        await connection.query(
            'UPDATE PERSON SET first_name = ?, middle_name = ?, last_name = ? WHERE person_id = ?',
            [first_name, middle_name || null, last_name, person_id]
        );
        
        // Update INSTRUCTOR
        await connection.query(
            'UPDATE INSTRUCTOR SET title = ?, dept_id = ? WHERE instructor_id = ?',
            [title, dept_id, id]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Instructor updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating instructor',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Delete instructor
// @route   DELETE /api/instructors/:id
// @access  Private (Admin only)
const deleteInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if instructor exists
        const [existing] = await db.pool.query(
            'SELECT instructor_id FROM INSTRUCTOR WHERE instructor_id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }
        
        await db.pool.query('DELETE FROM INSTRUCTOR WHERE instructor_id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Instructor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting instructor',
            error: error.message
        });
    }
};

// @desc    Get instructors by department
// @route   GET /api/instructors/department/:deptId
// @access  Private
const getInstructorsByDepartment = async (req, res) => {
    try {
        const { deptId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                i.instructor_id,
                p.first_name,
                p.last_name,
                i.title
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            WHERE i.dept_id = ?
            ORDER BY i.instructor_id
        `, [deptId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting instructors by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving instructors',
            error: error.message
        });
    }
};

// @desc    Search instructors
// @route   GET /api/instructors/search?q=query
// @access  Private
const searchInstructors = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }
        
        const searchTerm = `%${q}%`;
        
        const [rows] = await db.pool.query(`
            SELECT 
                i.instructor_id,
                p.first_name,
                p.last_name,
                CONCAT(p.first_name, ' ', p.last_name) as full_name,
                i.title,
                d.dept_name
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            JOIN DEPARTMENT d ON i.dept_id = d.dept_id
            WHERE p.first_name LIKE ? 
               OR p.last_name LIKE ? 
               OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?
               OR CAST(i.instructor_id AS CHAR) LIKE ?
            ORDER BY i.instructor_id
        `, [searchTerm, searchTerm, searchTerm, searchTerm]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error searching instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching instructors',
            error: error.message
        });
    }
};

module.exports = {
    getAllInstructors,
    getInstructorById,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorsByDepartment,
    searchInstructors
};