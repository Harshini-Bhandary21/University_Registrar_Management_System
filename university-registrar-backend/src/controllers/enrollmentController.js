const db = require('../config/db');

// @desc    Get all enrollments with details
// @route   GET /api/enrollments/all
// @access  Private
const getAllEnrollments = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                e.student_id,
                CONCAT(p.first_name, ' ', p.last_name) AS student_name,
                e.course_no,
                c.title AS course_title,
                e.year,
                e.semester_no,
                e.section_no,
                DATE_FORMAT(e.enroll_date, '%Y-%m-%d') AS enroll_date,
                e.status
            FROM ENROLLS e
            JOIN STUDENT s ON e.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN COURSE c ON e.course_no = c.course_no
            ORDER BY e.enroll_date DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving enrollments',
            error: error.message
        });
    }
};

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Private
const enrollStudent = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { student_id, course_no, year, semester_no, section_no, enroll_date } = req.body;
        
        // Validate required fields
        if (!student_id || !course_no || !year || !semester_no || !section_no) {
            return res.status(400).json({
                success: false,
                message: 'Missing required enrollment fields'
            });
        }
        
        // Check if student exists
        const [student] = await connection.query(
            'SELECT student_id FROM STUDENT WHERE student_id = ?',
            [student_id]
        );
        
        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Check if course offering exists
        const [offering] = await connection.query(
            `SELECT * FROM COURSE_OFFERING 
             WHERE course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [course_no, year, semester_no, section_no]
        );
        
        if (offering.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course offering not found'
            });
        }
        
        // Check capacity
        if (offering[0].enrolled_count >= offering[0].capacity) {
            return res.status(400).json({
                success: false,
                message: 'Course is full. Cannot enroll more students.'
            });
        }
        
        // Check if already enrolled
        const [existing] = await connection.query(
            `SELECT * FROM ENROLLS 
             WHERE student_id = ? AND course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [student_id, course_no, year, semester_no, section_no]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Student already enrolled in this course'
            });
        }
        
        const enrollDate = enroll_date || new Date().toISOString().split('T')[0];
        
        // Insert enrollment
        await connection.query(
            `INSERT INTO ENROLLS (student_id, course_no, year, semester_no, section_no, enroll_date, status)
             VALUES (?, ?, ?, ?, ?, ?, 'Enrolled')`,
            [student_id, course_no, year, semester_no, section_no, enrollDate]
        );
        
        // Update enrolled count
        await connection.query(
            `UPDATE COURSE_OFFERING 
             SET enrolled_count = enrolled_count + 1
             WHERE course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [course_no, year, semester_no, section_no]
        );
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Student enrolled successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error enrolling student:', error);
        res.status(500).json({
            success: false,
            message: 'Error enrolling student',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Drop enrollment
// @route   DELETE /api/enrollments
// @access  Private
const dropEnrollment = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { student_id, course_no, year, semester_no, section_no } = req.body;
        
        // Check if enrollment exists
        const [enrollment] = await connection.query(
            `SELECT * FROM ENROLLS 
             WHERE student_id = ? AND course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [student_id, course_no, year, semester_no, section_no]
        );
        
        if (enrollment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }
        
        // Delete enrollment
        await connection.query(
            `DELETE FROM ENROLLS 
             WHERE student_id = ? AND course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [student_id, course_no, year, semester_no, section_no]
        );
        
        // Update enrolled count
        await connection.query(
            `UPDATE COURSE_OFFERING 
             SET enrolled_count = GREATEST(enrolled_count - 1, 0)
             WHERE course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [course_no, year, semester_no, section_no]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Enrollment dropped successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error dropping enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error dropping enrollment',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Get enrollments by student
// @route   GET /api/enrollments/student/:studentId
// @access  Private
const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                e.course_no,
                c.title AS course_title,
                c.credits,
                e.year,
                e.semester_no,
                e.section_no,
                DATE_FORMAT(e.enroll_date, '%Y-%m-%d') AS enroll_date,
                e.status,
                co.timings,
                co.room_no,
                cr.building,
                CONCAT(p.first_name, ' ', p.last_name) AS instructor_name
            FROM ENROLLS e
            JOIN COURSE c ON e.course_no = c.course_no
            LEFT JOIN COURSE_OFFERING co ON e.course_no = co.course_no 
                AND e.year = co.year AND e.semester_no = co.semester_no AND e.section_no = co.section_no
            LEFT JOIN CLASSROOM cr ON co.room_no = cr.room_no
            LEFT JOIN INSTRUCTOR i ON co.instructor_id = i.instructor_id
            LEFT JOIN PERSON p ON i.person_id = p.person_id
            WHERE e.student_id = ?
            ORDER BY e.year DESC, e.semester_no DESC
        `, [studentId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting student enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving enrollments',
            error: error.message
        });
    }
};

// @desc    Get available courses for a student
// @route   GET /api/enrollments/available/:studentId
// @access  Private
const getAvailableCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                c.course_no,
                c.title,
                c.credits,
                c.dept_id,
                d.dept_name
            FROM COURSE c
            JOIN DEPARTMENT d ON c.dept_id = d.dept_id
            WHERE c.course_no NOT IN (
                SELECT course_no FROM ENROLLS WHERE student_id = ?
            )
            ORDER BY c.course_no
        `, [studentId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting available courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving available courses',
            error: error.message
        });
    }
};

module.exports = {
    getAllEnrollments,
    enrollStudent,
    dropEnrollment,
    getStudentEnrollments,
    getAvailableCourses
};