const db = require('../config/db');

// @desc    Generate complete student report
// @route   GET /api/reports/student/:studentId
// @access  Private
const generateStudentReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student details
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
                DATE_FORMAT(s.dob, '%Y-%m-%d') as dob_formatted,
                DATE_FORMAT(s.dob, '%M %d, %Y') as dob_long
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            WHERE s.student_id = ?
        `, [studentId]);
        
        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Get enrolled courses with details
        const [enrolledCourses] = await db.pool.query(`
            SELECT 
                e.course_no,
                c.title,
                c.credits,
                e.year,
                e.semester_no,
                e.section_no,
                e.enroll_date,
                DATE_FORMAT(e.enroll_date, '%Y-%m-%d') as enroll_date_formatted
            FROM ENROLLS e
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE e.student_id = ?
            ORDER BY e.year DESC, e.semester_no DESC
        `, [studentId]);
        
        // Get exam results with course details
        const [examResults] = await db.pool.query(`
            SELECT 
                r.result_id,
                r.marks,
                r.grade,
                e.exam_id,
                e.exam_type,
                e.max_marks,
                e.course_no,
                c.title as course_title,
                c.credits
            FROM RESULT r
            JOIN EXAM e ON r.exam_id = e.exam_id
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE r.student_id = ?
            ORDER BY e.course_no, e.exam_type
        `, [studentId]);
        
        // Calculate academic summary
        let totalMarks = 0;
        let totalMaxMarks = 0;
        const courseWiseMarks = {};
        
        examResults.forEach(result => {
            totalMarks += result.marks;
            totalMaxMarks += result.max_marks;
            
            if (!courseWiseMarks[result.course_no]) {
                courseWiseMarks[result.course_no] = {
                    course_no: result.course_no,
                    course_title: result.course_title,
                    totalMarks: 0,
                    totalMaxMarks: 0,
                    exams: []
                };
            }
            courseWiseMarks[result.course_no].totalMarks += result.marks;
            courseWiseMarks[result.course_no].totalMaxMarks += result.max_marks;
            courseWiseMarks[result.course_no].exams.push(result);
        });
        
        // Calculate course-wise percentages and grades
        const courseSummary = Object.values(courseWiseMarks).map(course => {
            const percentage = (course.totalMarks / course.totalMaxMarks) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B+';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
            else if (percentage >= 40) grade = 'D';
            
            return {
                ...course,
                percentage: percentage.toFixed(2),
                grade: grade
            };
        });
        
        const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
        
        let overallGrade = 'F';
        if (overallPercentage >= 90) overallGrade = 'A+';
        else if (overallPercentage >= 80) overallGrade = 'A';
        else if (overallPercentage >= 70) overallGrade = 'B+';
        else if (overallPercentage >= 60) overallGrade = 'B';
        else if (overallPercentage >= 50) overallGrade = 'C';
        else if (overallPercentage >= 40) overallGrade = 'D';
        
        const summary = {
            totalMarks: totalMarks,
            totalMaxMarks: totalMaxMarks,
            overallPercentage: overallPercentage.toFixed(2),
            overallGrade: overallGrade,
            coursesCount: enrolledCourses.length,
            examsCount: examResults.length,
            courseWiseSummary: courseSummary
        };
        
        // Generate report data
        const report = {
            student: student[0],
            enrolledCourses: enrolledCourses,
            examResults: examResults,
            summary: summary,
            generatedAt: new Date().toISOString(),
            academicYear: new Date().getFullYear()
        };
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating student report',
            error: error.message
        });
    }
};

// @desc    Generate department report
// @route   GET /api/reports/department/:deptId
// @access  Private
const generateDepartmentReport = async (req, res) => {
    try {
        const { deptId } = req.params;
        
        // Get department info
        const [department] = await db.pool.query(
            'SELECT dept_id, dept_name FROM DEPARTMENT WHERE dept_id = ?',
            [deptId]
        );
        
        if (department.length === 0) {
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
        `, [deptId]);
        
        // Get instructors in department
        const [instructors] = await db.pool.query(`
            SELECT i.instructor_id, p.first_name, p.last_name, i.title
            FROM INSTRUCTOR i
            JOIN PERSON p ON i.person_id = p.person_id
            WHERE i.dept_id = ?
        `, [deptId]);
        
        // Get students enrolled in department courses
        const [students] = await db.pool.query(`
            SELECT DISTINCT s.student_id, p.first_name, p.last_name, pr.program_name
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN PROGRAM pr ON s.program_id = pr.program_id
            JOIN ENROLLS e ON s.student_id = e.student_id
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE c.dept_id = ?
        `, [deptId]);
        
        res.json({
            success: true,
            data: {
                department: department[0],
                courses: courses,
                instructors: instructors,
                students: students,
                statistics: {
                    totalCourses: courses.length,
                    totalInstructors: instructors.length,
                    totalStudents: students.length
                }
            }
        });
    } catch (error) {
        console.error('Error generating department report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating department report',
            error: error.message
        });
    }
};

// @desc    Search across all entities
// @route   GET /api/reports/search?q=query&type=all
// @access  Private
const globalSearch = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }
        
        const searchTerm = `%${q}%`;
        const results = {};
        
        // Search students
        if (type === 'all' || type === 'students') {
            const [students] = await db.pool.query(`
                SELECT 
                    s.student_id as id,
                    CONCAT(p.first_name, ' ', p.last_name) as name,
                    'student' as entity_type,
                    pr.program_name as additional_info
                FROM STUDENT s
                JOIN PERSON p ON s.person_id = p.person_id
                JOIN PROGRAM pr ON s.program_id = pr.program_id
                WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR CAST(s.student_id AS CHAR) LIKE ?
                LIMIT 10
            `, [searchTerm, searchTerm, searchTerm]);
            results.students = students;
        }
        
        // Search courses
        if (type === 'all' || type === 'courses') {
            const [courses] = await db.pool.query(`
                SELECT 
                    course_no as id,
                    title as name,
                    'course' as entity_type,
                    CONCAT(credits, ' credits') as additional_info
                FROM COURSE
                WHERE course_no LIKE ? OR title LIKE ?
                LIMIT 10
            `, [searchTerm, searchTerm]);
            results.courses = courses;
        }
        
        // Search instructors
        if (type === 'all' || type === 'instructors') {
            const [instructors] = await db.pool.query(`
                SELECT 
                    i.instructor_id as id,
                    CONCAT(p.first_name, ' ', p.last_name) as name,
                    'instructor' as entity_type,
                    i.title as additional_info
                FROM INSTRUCTOR i
                JOIN PERSON p ON i.person_id = p.person_id
                WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR CAST(i.instructor_id AS CHAR) LIKE ?
                LIMIT 10
            `, [searchTerm, searchTerm, searchTerm]);
            results.instructors = instructors;
        }
        
        res.json({
            success: true,
            query: q,
            results: results
        });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
};

// @desc    Get program-wise student statistics
// @route   GET /api/reports/program-statistics
// @access  Private
const getProgramStatistics = async (req, res) => {
    try {
        const [data] = await db.pool.query(`
            SELECT 
                pr.program_id,
                pr.program_name,
                pr.duration,
                COUNT(s.student_id) as student_count,
                AVG(s.age) as average_age,
                MIN(s.age) as min_age,
                MAX(s.age) as max_age
            FROM PROGRAM pr
            LEFT JOIN STUDENT s ON pr.program_id = s.program_id
            GROUP BY pr.program_id
            ORDER BY pr.program_id
        `);
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error getting program statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving program statistics',
            error: error.message
        });
    }
};

// @desc    Get grade distribution
// @route   GET /api/reports/grade-distribution
// @access  Private
const getGradeDistribution = async (req, res) => {
    try {
        const [data] = await db.pool.query(`
            SELECT 
                grade,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM RESULT)), 2) as percentage
            FROM RESULT
            GROUP BY grade
            ORDER BY 
                FIELD(grade, 'A+', 'A', 'B+', 'B', 'C', 'D', 'F')
        `);
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error getting grade distribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving grade distribution',
            error: error.message
        });
    }
};

module.exports = {
    generateStudentReport,
    generateDepartmentReport,
    globalSearch,
    getProgramStatistics,
    getGradeDistribution
};