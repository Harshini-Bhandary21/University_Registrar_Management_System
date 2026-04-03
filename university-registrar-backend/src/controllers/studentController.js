const db = require('../config/db');

// @desc    Get all students with details
// @route   GET /api/students
// @access  Private
const getAllStudents = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.student_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                s.dob,
                s.age,
                pr.program_id,
                pr.program_name,
                pr.duration
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            ORDER BY s.student_id
        `;
        
        const [rows] = await db.pool.query(query);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving students',
            error: error.message
        });
    }
};

// @desc    Get student by ID with complete details
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get student basic info
        const [student] = await db.pool.query(`
            SELECT 
                s.student_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                s.dob,
                s.age,
                pr.program_id,
                pr.program_name,
                pr.duration,
                DATE_FORMAT(s.dob, '%Y-%m-%d') as dob_formatted
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            WHERE s.student_id = ?
        `, [id]);
        
        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Get enrolled courses
        const [courses] = await db.pool.query(`
            SELECT 
                e.course_no,
                c.title,
                c.credits,
                e.year,
                e.semester_no,
                e.section_no,
                e.enroll_date
            FROM ENROLLS e
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE e.student_id = ?
            ORDER BY e.year DESC, e.semester_no DESC
        `, [id]);
        
        // Get exam results
        const [results] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title
            FROM RESULT r
            JOIN EXAM e ON r.exam_id = e.exam_id
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE r.student_id = ?
            ORDER BY e.exam_id
        `, [id]);
        
        // Calculate statistics
        let totalMarks = 0;
        let totalMaxMarks = 0;
        results.forEach(result => {
            totalMarks += result.marks;
            totalMaxMarks += result.max_marks;
        });
        const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
        
        res.json({
            success: true,
            data: {
                student: student[0],
                enrolledCourses: courses,
                results: results,
                statistics: {
                    totalMarks: totalMarks,
                    totalMaxMarks: totalMaxMarks,
                    percentage: percentage.toFixed(2),
                    coursesCount: courses.length,
                    examsCount: results.length
                }
            }
        });
    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving student details',
            error: error.message
        });
    }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
const createStudent = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { 
            first_name, 
            middle_name, 
            last_name, 
            dob, 
            age, 
            program_id 
        } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !dob || !age || !program_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Insert into PERSON table
        const [personResult] = await connection.query(
            'INSERT INTO PERSON (first_name, middle_name, last_name) VALUES (?, ?, ?)',
            [first_name, middle_name || null, last_name]
        );
        
        const person_id = personResult.insertId;
        
        // Insert into STUDENT table
        const [studentResult] = await connection.query(
            `INSERT INTO STUDENT (person_id, dob, age, program_id) 
             VALUES (?, ?, ?, ?)`,
            [person_id, dob, age, program_id]
        );
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                student_id: studentResult.insertId,
                person_id: person_id
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
const updateStudent = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { 
            first_name, 
            middle_name, 
            last_name, 
            dob, 
            age, 
            program_id 
        } = req.body;
        
        // Check if student exists
        const [existingStudent] = await connection.query(
            'SELECT person_id FROM STUDENT WHERE student_id = ?',
            [id]
        );
        
        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const person_id = existingStudent[0].person_id;
        
        // Update PERSON table
        await connection.query(
            'UPDATE PERSON SET first_name = ?, middle_name = ?, last_name = ? WHERE person_id = ?',
            [first_name, middle_name || null, last_name, person_id]
        );
        
        // Update STUDENT table
        await connection.query(
            'UPDATE STUDENT SET dob = ?, age = ?, program_id = ? WHERE student_id = ?',
            [dob, age, program_id, id]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if student exists
        const [existingStudent] = await db.pool.query(
            'SELECT student_id FROM STUDENT WHERE student_id = ?',
            [id]
        );
        
        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Delete student (cascade will handle related records)
        await db.pool.query('DELETE FROM STUDENT WHERE student_id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};

// @desc    Filter students by program
// @route   GET /api/students/filter/:programId
// @access  Private
const filterStudentsByProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        
        const [rows] = await db.pool.query(`
            SELECT 
                s.student_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                s.age,
                pr.program_name
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            WHERE s.program_id = ?
            ORDER BY s.student_id
        `, [programId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error filtering students:', error);
        res.status(500).json({
            success: false,
            message: 'Error filtering students',
            error: error.message
        });
    }
};

// @desc    Search students
// @route   GET /api/students/search?q=query
// @access  Private
const searchStudents = async (req, res) => {
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
                s.student_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                CONCAT(p.first_name, ' ', p.last_name) as full_name,
                pr.program_name
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            WHERE p.first_name LIKE ? 
               OR p.last_name LIKE ? 
               OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?
               OR CAST(s.student_id AS CHAR) LIKE ?
            ORDER BY s.student_id
        `, [searchTerm, searchTerm, searchTerm, searchTerm]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching students',
            error: error.message
        });
    }
};

// @desc    Get students paginated
// @route   GET /api/students/paginated?page=1&limit=10
// @access  Private
const getStudentsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Get total count
        const [countResult] = await db.pool.query('SELECT COUNT(*) as total FROM STUDENT');
        const total = countResult[0].total;
        
        // Get paginated data
        const [rows] = await db.pool.query(`
            SELECT 
                s.student_id,
                p.first_name,
                p.middle_name,
                p.last_name,
                s.age,
                pr.program_name
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            ORDER BY s.student_id
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting paginated students:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving students',
            error: error.message
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    filterStudentsByProgram,
    searchStudents,
    getStudentsPaginated
};