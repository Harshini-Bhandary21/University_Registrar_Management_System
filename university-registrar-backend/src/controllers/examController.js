const db = require('../config/db');

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin only)
const createExam = async (req, res) => {
    try {
        const { exam_type, max_marks, course_no, year, semester_no, section_no, exam_date, duration_minutes } = req.body;
        
        if (!exam_type || !max_marks || !course_no || !year || !semester_no || !section_no) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
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
        
        const [result] = await db.pool.query(
            `INSERT INTO EXAM (exam_type, max_marks, course_no, year, semester_no, section_no, exam_date, duration_minutes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [exam_type, max_marks, course_no, year, semester_no, section_no, exam_date || null, duration_minutes || 180]
        );
        
        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: { exam_id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating exam',
            error: error.message
        });
    }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getAllExams = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title,
                e.year,
                e.semester_no,
                e.section_no,
                e.exam_date,
                e.duration_minutes
            FROM EXAM e
            JOIN COURSE c ON e.course_no = c.course_no
            ORDER BY e.year DESC, e.semester_no DESC, e.exam_date DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting exams:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving exams',
            error: error.message
        });
    }
};

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title,
                e.year,
                e.semester_no,
                e.section_no,
                e.exam_date,
                e.duration_minutes
            FROM EXAM e
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE e.exam_id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }
        
        // Get results for this exam
        const [results] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                r.student_id,
                p.first_name,
                p.last_name
            FROM RESULT r
            JOIN STUDENT s ON r.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            WHERE r.exam_id = ?
            ORDER BY r.marks DESC
        `, [id]);
        
        res.json({
            success: true,
            data: {
                exam: rows[0],
                results: results,
                total_students: results.length,
                average_marks: results.length > 0 ? results.reduce((sum, r) => sum + r.marks, 0) / results.length : 0
            }
        });
    } catch (error) {
        console.error('Error getting exam:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving exam details',
            error: error.message
        });
    }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin only)
const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { exam_type, max_marks, course_no, year, semester_no, section_no, exam_date, duration_minutes } = req.body;
        
        const [result] = await db.pool.query(
            `UPDATE EXAM 
             SET exam_type = ?, max_marks = ?, course_no = ?, year = ?, semester_no = ?, section_no = ?, exam_date = ?, duration_minutes = ?
             WHERE exam_id = ?`,
            [exam_type, max_marks, course_no, year, semester_no, section_no, exam_date, duration_minutes, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Exam updated successfully'
        });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating exam',
            error: error.message
        });
    }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin only)
const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if exam has results
        const [results] = await db.pool.query('SELECT * FROM RESULT WHERE exam_id = ?', [id]);
        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete exam with existing results. Delete results first.'
            });
        }
        
        const [result] = await db.pool.query('DELETE FROM EXAM WHERE exam_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting exam',
            error: error.message
        });
    }
};

// @desc    Get exams by course
// @route   GET /api/exams/course/:courseNo
// @access  Private
const getExamsByCourse = async (req, res) => {
    try {
        const { courseNo } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT exam_id, exam_type, max_marks, year, semester_no, section_no, exam_date, duration_minutes
            FROM EXAM
            WHERE course_no = ?
            ORDER BY year DESC, semester_no DESC, exam_date DESC
        `, [courseNo]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting exams by course:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving exams',
            error: error.message
        });
    }
};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamsByCourse
};