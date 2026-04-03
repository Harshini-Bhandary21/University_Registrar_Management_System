const db = require('../config/db');

// Helper function to calculate grade
const calculateGrade = (marks, max_marks) => {
    const percentage = (marks / max_marks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

// @desc    Add/Update student result
// @route   POST /api/results
// @access  Private (Admin only)
const addOrUpdateResult = async (req, res) => {
    try {
        const { student_id, exam_id, marks } = req.body;
        
        if (!student_id || !exam_id || marks === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, Exam ID, and Marks are required'
            });
        }
        
        // Get exam details
        const [exam] = await db.pool.query(
            'SELECT max_marks, course_no FROM EXAM WHERE exam_id = ?',
            [exam_id]
        );
        
        if (exam.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
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
        
        const grade = calculateGrade(marks, exam[0].max_marks);
        
        // Check if result already exists
        const [existing] = await db.pool.query(
            'SELECT result_id FROM RESULT WHERE student_id = ? AND exam_id = ?',
            [student_id, exam_id]
        );
        
        let result;
        if (existing.length > 0) {
            // Update existing result
            await db.pool.query(
                'UPDATE RESULT SET marks = ?, grade = ? WHERE result_id = ?',
                [marks, grade, existing[0].result_id]
            );
            result = { result_id: existing[0].result_id };
        } else {
            // Insert new result
            const [insertResult] = await db.pool.query(
                'INSERT INTO RESULT (marks, grade, student_id, exam_id) VALUES (?, ?, ?, ?)',
                [marks, grade, student_id, exam_id]
            );
            result = { result_id: insertResult.insertId };
        }
        
        res.json({
            success: true,
            message: existing.length > 0 ? 'Result updated successfully' : 'Result added successfully',
            data: { result_id: result.result_id, grade, marks, max_marks: exam[0].max_marks }
        });
    } catch (error) {
        console.error('Error adding/updating result:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving result',
            error: error.message
        });
    }
};

// @desc    Get all results for a student
// @route   GET /api/results/student/:studentId
// @access  Private
const getStudentResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title,
                e.year,
                e.semester_no,
                e.exam_date
            FROM RESULT r
            JOIN EXAM e ON r.exam_id = e.exam_id
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE r.student_id = ?
            ORDER BY e.year DESC, e.semester_no DESC, e.exam_date DESC
        `, [studentId]);
        
        // Calculate summary
        let totalMarks = 0;
        let totalMaxMarks = 0;
        rows.forEach(row => {
            totalMarks += row.marks;
            totalMaxMarks += row.max_marks;
        });
        
        res.json({
            success: true,
            count: rows.length,
            data: rows,
            summary: {
                totalMarks,
                totalMaxMarks,
                percentage: totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error getting student results:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving results',
            error: error.message
        });
    }
};

// @desc    Get all results for an exam
// @route   GET /api/results/exam/:examId
// @access  Private
const getExamResults = async (req, res) => {
    try {
        const { examId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                s.student_id,
                p.first_name,
                p.last_name
            FROM RESULT r
            JOIN STUDENT s ON r.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            WHERE r.exam_id = ?
            ORDER BY r.marks DESC
        `, [examId]);
        
        // Get exam details
        const [exam] = await db.pool.query(`
            SELECT e.*, c.title as course_title
            FROM EXAM e
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE e.exam_id = ?
        `, [examId]);
        
        // Calculate statistics
        const totalStudents = rows.length;
        const averageMarks = totalStudents > 0 ? rows.reduce((sum, r) => sum + r.marks, 0) / totalStudents : 0;
        const highestMarks = totalStudents > 0 ? Math.max(...rows.map(r => r.marks)) : 0;
        const lowestMarks = totalStudents > 0 ? Math.min(...rows.map(r => r.marks)) : 0;
        
        res.json({
            success: true,
            count: rows.length,
            data: rows,
            exam: exam[0] || null,
            statistics: {
                totalStudents,
                averageMarks: averageMarks.toFixed(2),
                highestMarks,
                lowestMarks
            }
        });
    } catch (error) {
        console.error('Error getting exam results:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving exam results',
            error: error.message
        });
    }
};

// @desc    Get all results (for data entry page)
// @route   GET /api/results/all
// @access  Private
const getAllResults = async (req, res) => {
    try {
        const [rows] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                s.student_id,
                p.first_name,
                p.last_name,
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title,
                e.year,
                e.semester_no
            FROM RESULT r
            JOIN STUDENT s ON r.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN EXAM e ON r.exam_id = e.exam_id
            JOIN COURSE c ON e.course_no = c.course_no
            ORDER BY r.result_id DESC
            LIMIT 200
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting all results:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving results',
            error: error.message
        });
    }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin only)
const deleteResult = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.pool.query('DELETE FROM RESULT WHERE result_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Result deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting result',
            error: error.message
        });
    }
};

// @desc    Bulk upload results
// @route   POST /api/results/bulk
// @access  Private (Admin only)
const bulkUploadResults = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { results } = req.body;
        
        if (!results || !Array.isArray(results) || results.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No results data provided'
            });
        }
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const item of results) {
            try {
                const { student_id, exam_id, marks } = item;
                
                if (!student_id || !exam_id || marks === undefined) {
                    errorCount++;
                    errors.push({ student_id, exam_id, error: 'Missing fields' });
                    continue;
                }
                
                // Get exam details
                const [exam] = await connection.query(
                    'SELECT max_marks, course_no FROM EXAM WHERE exam_id = ?',
                    [exam_id]
                );
                
                if (exam.length === 0) {
                    errorCount++;
                    errors.push({ student_id, exam_id, error: 'Exam not found' });
                    continue;
                }
                
                const grade = calculateGrade(marks, exam[0].max_marks);
                
                // Check if result exists
                const [existing] = await connection.query(
                    'SELECT result_id FROM RESULT WHERE student_id = ? AND exam_id = ?',
                    [student_id, exam_id]
                );
                
                if (existing.length > 0) {
                    await connection.query(
                        'UPDATE RESULT SET marks = ?, grade = ? WHERE result_id = ?',
                        [marks, grade, existing[0].result_id]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO RESULT (marks, grade, student_id, exam_id) VALUES (?, ?, ?, ?)',
                        [marks, grade, student_id, exam_id]
                    );
                }
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push({ student_id: item.student_id, exam_id: item.exam_id, error: err.message });
            }
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Bulk upload completed: ${successCount} successful, ${errorCount} failed`,
            data: { successCount, errorCount, errors: errors.slice(0, 10) }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error in bulk upload:', error);
        res.status(500).json({
            success: false,
            message: 'Error during bulk upload',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    addOrUpdateResult,
    getStudentResults,
    getExamResults,
    getAllResults,
    deleteResult,
    bulkUploadResults
};