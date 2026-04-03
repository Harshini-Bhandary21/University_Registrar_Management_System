const db = require('../config/db');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                c.course_no,
                c.title,
                c.credits,
                c.syllabus,
                c.dept_id,
                d.dept_name
            FROM COURSE c
            JOIN DEPARTMENT d ON c.dept_id = d.dept_id
            ORDER BY c.course_no
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving courses',
            error: error.message
        });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                c.course_no,
                c.title,
                c.credits,
                c.syllabus,
                c.dept_id,
                d.dept_name
            FROM COURSE c
            JOIN DEPARTMENT d ON c.dept_id = d.dept_id
            WHERE c.course_no = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        // Get prerequisites
        const [prerequisites] = await db.pool.query(`
            SELECT 
                p.prereq_course_no,
                c.title as prereq_title
            FROM PREREQUISITE p
            JOIN COURSE c ON p.prereq_course_no = c.course_no
            WHERE p.course_no = ?
        `, [id]);
        
        // Get course offerings
        const [offerings] = await db.pool.query(`
            SELECT 
                co.year,
                co.semester_no,
                co.section_no,
                co.timings,
                co.room_no,
                cr.building,
                s.semester_name,
                s.academic_year
            FROM COURSE_OFFERING co
            LEFT JOIN CLASSROOM cr ON co.room_no = cr.room_no
            LEFT JOIN SEMESTER s ON co.semester_id = s.semester_id
            WHERE co.course_no = ?
            ORDER BY co.year DESC, co.semester_no DESC
        `, [id]);
        
        res.json({
            success: true,
            data: {
                course: rows[0],
                prerequisites: prerequisites,
                offerings: offerings
            }
        });
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving course details',
            error: error.message
        });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin only)
const createCourse = async (req, res) => {
    try {
        const { course_no, title, credits, syllabus, dept_id } = req.body;
        
        // Validate required fields
        if (!course_no || !title || !credits || !dept_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: course_no, title, credits, dept_id'
            });
        }
        
        // Check if course already exists
        const [existing] = await db.pool.query(
            'SELECT course_no FROM COURSE WHERE course_no = ?',
            [course_no]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Course with this number already exists'
            });
        }
        
        await db.pool.query(
            'INSERT INTO COURSE (course_no, title, credits, syllabus, dept_id) VALUES (?, ?, ?, ?, ?)',
            [course_no, title, credits, syllabus || null, dept_id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: { course_no }
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, credits, syllabus, dept_id } = req.body;
        
        // Check if course exists
        const [existing] = await db.pool.query(
            'SELECT course_no FROM COURSE WHERE course_no = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        await db.pool.query(
            'UPDATE COURSE SET title = ?, credits = ?, syllabus = ?, dept_id = ? WHERE course_no = ?',
            [title, credits, syllabus || null, dept_id, id]
        );
        
        res.json({
            success: true,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if course exists
        const [existing] = await db.pool.query(
            'SELECT course_no FROM COURSE WHERE course_no = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        await db.pool.query('DELETE FROM COURSE WHERE course_no = ?', [id]);
        
        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

// @desc    Get courses by department
// @route   GET /api/courses/department/:deptId
// @access  Private
const getCoursesByDepartment = async (req, res) => {
    try {
        const { deptId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                c.course_no,
                c.title,
                c.credits,
                d.dept_name
            FROM COURSE c
            JOIN DEPARTMENT d ON c.dept_id = d.dept_id
            WHERE c.dept_id = ?
            ORDER BY c.course_no
        `, [deptId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting courses by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving courses',
            error: error.message
        });
    }
};

// @desc    Add prerequisite
// @route   POST /api/courses/:courseNo/prerequisite
// @access  Private (Admin only)
const addPrerequisite = async (req, res) => {
    try {
        const { courseNo } = req.params;
        const { prereq_course_no } = req.body;
        
        // Check if both courses exist
        const [course1] = await db.pool.query('SELECT course_no FROM COURSE WHERE course_no = ?', [courseNo]);
        const [course2] = await db.pool.query('SELECT course_no FROM COURSE WHERE course_no = ?', [prereq_course_no]);
        
        if (course1.length === 0 || course2.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'One or both courses not found'
            });
        }
        
        await db.pool.query(
            'INSERT INTO PREREQUISITE (course_no, prereq_course_no) VALUES (?, ?)',
            [courseNo, prereq_course_no]
        );
        
        res.status(201).json({
            success: true,
            message: 'Prerequisite added successfully'
        });
    } catch (error) {
        console.error('Error adding prerequisite:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Prerequisite already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding prerequisite',
            error: error.message
        });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByDepartment,
    addPrerequisite
};