const db = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const [studentCount] = await db.pool.query('SELECT COUNT(*) as count FROM STUDENT');
        const [courseCount] = await db.pool.query('SELECT COUNT(*) as count FROM COURSE');
        const [instructorCount] = await db.pool.query('SELECT COUNT(*) as count FROM INSTRUCTOR');
        const [departmentCount] = await db.pool.query('SELECT COUNT(*) as count FROM DEPARTMENT');
        const [enrollmentCount] = await db.pool.query('SELECT COUNT(*) as count FROM ENROLLS');
        
        // Students per program
        const [studentsPerProgram] = await db.pool.query(`
            SELECT 
                pr.program_id,
                pr.program_name,
                COUNT(s.student_id) as count
            FROM PROGRAM pr
            LEFT JOIN STUDENT s ON pr.program_id = s.program_id
            GROUP BY pr.program_id
            ORDER BY count DESC
        `);
        
        // Courses per department
        const [coursesPerDepartment] = await db.pool.query(`
            SELECT 
                d.dept_id,
                d.dept_name,
                COUNT(c.course_no) as count
            FROM DEPARTMENT d
            LEFT JOIN COURSE c ON d.dept_id = c.dept_id
            GROUP BY d.dept_id
            ORDER BY count DESC
        `);
        
        // Recent enrollments (last 30 days)
        const [recentEnrollments] = await db.pool.query(`
            SELECT 
                e.student_id,
                p.first_name,
                p.last_name,
                e.course_no,
                c.title as course_title,
                e.enroll_date
            FROM ENROLLS e
            JOIN STUDENT s ON e.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN COURSE c ON e.course_no = c.course_no
            WHERE e.enroll_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY e.enroll_date DESC
            LIMIT 10
        `);
        
        // Grade distribution
        const [gradeDistribution] = await db.pool.query(`
            SELECT 
                grade,
                COUNT(*) as count
            FROM RESULT
            GROUP BY grade
            ORDER BY 
                FIELD(grade, 'A+', 'A', 'B+', 'B', 'C', 'D', 'F')
        `);
        
        // Top performing students
        const [topStudents] = await db.pool.query(`
            SELECT 
                s.student_id,
                p.first_name,
                p.last_name,
                ROUND(AVG(r.marks * 100.0 / e.max_marks), 2) as average_percentage
            FROM STUDENT s
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN RESULT r ON s.student_id = r.student_id
            JOIN EXAM e ON r.exam_id = e.exam_id
            GROUP BY s.student_id
            HAVING COUNT(r.result_id) > 0
            ORDER BY average_percentage DESC
            LIMIT 5
        `);
        
        res.json({
            success: true,
            data: {
                counts: {
                    students: studentCount[0].count,
                    courses: courseCount[0].count,
                    instructors: instructorCount[0].count,
                    departments: departmentCount[0].count,
                    enrollments: enrollmentCount[0].count
                },
                studentsPerProgram: studentsPerProgram,
                coursesPerDepartment: coursesPerDepartment,
                recentEnrollments: recentEnrollments,
                gradeDistribution: gradeDistribution,
                topStudents: topStudents
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        
        // Get recent enrollments
        const [enrollments] = await db.pool.query(`
            SELECT 
                'enrollment' as activity_type,
                e.enroll_date as activity_date,
                CONCAT(p.first_name, ' ', p.last_name) as student_name,
                c.title as course_title,
                e.course_no
            FROM ENROLLS e
            JOIN STUDENT s ON e.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN COURSE c ON e.course_no = c.course_no
            ORDER BY e.enroll_date DESC
            LIMIT ?
        `, [limit]);
        
        // Get recent results
        const [results] = await db.pool.query(`
            SELECT 
                'result' as activity_type,
                NOW() as activity_date,
                CONCAT(p.first_name, ' ', p.last_name) as student_name,
                r.grade,
                e.exam_type,
                c.title as course_title
            FROM RESULT r
            JOIN STUDENT s ON r.student_id = s.student_id
            JOIN PERSON p ON s.person_id = p.person_id
            JOIN EXAM e ON r.exam_id = e.exam_id
            JOIN COURSE c ON e.course_no = c.course_no
            ORDER BY r.result_id DESC
            LIMIT ?
        `, [limit]);
        
        // Combine and sort activities
        const activities = [...enrollments, ...results];
        activities.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
        
        res.json({
            success: true,
            data: activities.slice(0, limit)
        });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent activity',
            error: error.message
        });
    }
};

// @desc    Get enrollment trends
// @route   GET /api/dashboard/enrollment-trends
// @access  Private
const getEnrollmentTrends = async (req, res) => {
    try {
        const [data] = await db.pool.query(`
            SELECT 
                year,
                semester_no,
                COUNT(*) as enrollment_count,
                COUNT(DISTINCT course_no) as course_count,
                COUNT(DISTINCT student_id) as student_count
            FROM ENROLLS
            GROUP BY year, semester_no
            ORDER BY year DESC, semester_no DESC
        `);
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error getting enrollment trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving enrollment trends',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivity,
    getEnrollmentTrends
};