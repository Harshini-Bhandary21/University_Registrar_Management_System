const db = require('../config/db');

// @desc    Get all course offerings
// @route   GET /api/course-offerings
// @access  Private
const getAllOfferings = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                co.course_no,
                c.title AS course_title,
                co.year,
                co.semester_no,
                co.section_no,
                co.timings,
                co.room_no,
                cr.building,
                co.capacity,
                co.enrolled_count,
                co.instructor_id,
                CONCAT(p.first_name, ' ', p.last_name) AS instructor_name,
                s.semester_name,
                s.academic_year
            FROM COURSE_OFFERING co
            JOIN COURSE c ON co.course_no = c.course_no
            LEFT JOIN CLASSROOM cr ON co.room_no = cr.room_no
            LEFT JOIN INSTRUCTOR i ON co.instructor_id = i.instructor_id
            LEFT JOIN PERSON p ON i.person_id = p.person_id
            LEFT JOIN SEMESTER s ON co.semester_id = s.semester_id
            ORDER BY co.year DESC, co.semester_no DESC, co.course_no
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting offerings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving course offerings',
            error: error.message
        });
    }
};

// @desc    Get offering by ID
// @route   GET /api/course-offerings/:courseNo/:year/:semester/:section
// @access  Private
const getOfferingById = async (req, res) => {
    try {
        const { courseNo, year, semester, section } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                co.*,
                c.title AS course_title,
                cr.building,
                CONCAT(p.first_name, ' ', p.last_name) AS instructor_name
            FROM COURSE_OFFERING co
            JOIN COURSE c ON co.course_no = c.course_no
            LEFT JOIN CLASSROOM cr ON co.room_no = cr.room_no
            LEFT JOIN INSTRUCTOR i ON co.instructor_id = i.instructor_id
            LEFT JOIN PERSON p ON i.person_id = p.person_id
            WHERE co.course_no = ? AND co.year = ? AND co.semester_no = ? AND co.section_no = ?
        `, [courseNo, year, semester, section]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course offering not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error getting offering:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving course offering',
            error: error.message
        });
    }
};

// @desc    Create course offering
// @route   POST /api/course-offerings
// @access  Private (Admin only)
const createOffering = async (req, res) => {
    try {
        const { course_no, year, semester_no, section_no, timings, room_no, semester_id, instructor_id, capacity } = req.body;
        
        // Check if offering already exists
        const [existing] = await db.pool.query(
            `SELECT * FROM COURSE_OFFERING 
             WHERE course_no = ? AND year = ? AND semester_no = ? AND section_no = ?`,
            [course_no, year, semester_no, section_no]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Course offering already exists'
            });
        }
        
        const [result] = await db.pool.query(
            `INSERT INTO COURSE_OFFERING 
             (course_no, year, semester_no, section_no, timings, room_no, semester_id, instructor_id, capacity, enrolled_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [course_no, year, semester_no, section_no, timings, room_no, semester_id, instructor_id, capacity || 50]
        );
        
        res.status(201).json({
            success: true,
            message: 'Course offering created successfully',
            data: { course_no, year, semester_no, section_no }
        });
    } catch (error) {
        console.error('Error creating offering:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course offering',
            error: error.message
        });
    }
};

module.exports = {
    getAllOfferings,
    getOfferingById,
    createOffering
};