const db = require('../config/db');

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Private
const enrollStudent = async (req, res) => {
    try {
        const { student_id, course_no, year, semester_no, section_no, enroll_date } = req.body;
        
        // Validate required fields
        if (!student_id || !course_no || !year || !semester_no || !section_no) {
            return res.status(400).json({
                success: false,
                message: 'Missing required enrollment fields'
            });
        }
        
        // Check if student exists
        const [student] = await db.pool.query(
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
        const [offering] = await db.pool.query(
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
        
        // Check if already enrolled
        const [existing] = await db.pool.query(
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
        
        await db.pool.query(
            `INSERT INTO ENROLLS (student_id, course_no, year, semester_no, section_no, enroll_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, course_no, year, semester_no, section_no, enrollDate]
        );
        
        res.status(201).json({
            success: true,
            message: 'Student enrolled successfully'
        });
    } catch (error) {
        console.error('Error enrolling student:', error);
        res.status(500).json({
            success: false,
            message: 'Error enrolling student',
            error: error.message
        });
    }
};

// @desc    Get enrollments for a student
// @route   GET /api/enrollments/student/:studentId
// @access  Private
const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                e.course_no,
                c.title,
                c.credits,
                e.year,
                e.semester_no,
                e.section_no,
                e.enroll_date,
                co.timings,
                co.room_no,
                cr.building
            FROM ENROLLS e
            JOIN COURSE c ON e.course_no = c.course_no
            LEFT JOIN COURSE_OFFERING co ON e.course_no = co.course_no 
                AND e.year = co.year AND e.semester_no = co.semester_no AND e.section_no = co.section_no
            LEFT JOIN CLASSROOM cr ON co.room_no = cr.room_no
            WHERE e.student_id = ?
            ORDER BY e.year DESC, e.semester_no DESC
        `, [studentId]);
        
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

// @desc    Get students in a course offering
// @route   GET /api/enrollments/course/:courseNo/:year/:semester/:section
// @access  Private
const getCourseEnrollments = async (req, res) => {
    try {
        const { courseNo, year, semester, section } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                s.student_id,
                p.first_name,
                p.last_name,
                e.enroll_date
            FROM ENROLLS e
            JOIN STUDENT s ON e.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            WHERE e.course_no = ? AND e.year = ? AND e.semester_no = ? AND e.section_no = ?
            ORDER BY s.student_id
        `, [courseNo, year, semester, section]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting course enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving enrollments',
            error: error.message
        });
    }
};

// @desc    Drop enrollment
// @route   DELETE /api/enrollments
// @access  Private
const dropEnrollment = async (req, res) => {
    try {
        const { student_id, course_no, year, semester_no, section_no } = req.body;
        
        const [result] = await db.pool.query(
            `DELETE FROM ENROLLS 
             WHERE student_id = ? AND course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [student_id, course_no, year, semester_no, section_no]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Enrollment dropped successfully'
        });
    } catch (error) {
        console.error('Error dropping enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error dropping enrollment',
            error: error.message
        });
    }
};

module.exports = {
    enrollStudent,
    getStudentEnrollments,
    getCourseEnrollments,
    dropEnrollment
};