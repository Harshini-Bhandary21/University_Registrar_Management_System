-- ============================================
-- COMPLETE UNIVERSITY REGISTRAR DATABASE
 -- ============================================

-- Drop database if exists and recreate
DROP DATABASE IF EXISTS university_registrar;
CREATE DATABASE university_registrar;
USE university_registrar;

-- ============================================
-- 1. PERSON Table
-- ============================================
CREATE TABLE PERSON (
    person_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(20),
    last_name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. DEPARTMENT Table
-- ============================================
CREATE TABLE DEPARTMENT (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PROGRAM Table
-- ============================================
CREATE TABLE PROGRAM (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(30) NOT NULL UNIQUE,
    duration INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. STUDENT Table
-- ============================================
CREATE TABLE STUDENT (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    dob DATE NOT NULL,
    age INT,
    program_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES PROGRAM(program_id),
    INDEX idx_program (program_id),
    INDEX idx_age (age)
);

-- ============================================
-- 5. INSTRUCTOR Table
-- ============================================
CREATE TABLE INSTRUCTOR (
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    dept_id INT NOT NULL,
    hire_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id),
    INDEX idx_department (dept_id)
);

-- ============================================
-- 6. CONTACT Table
-- ============================================
CREATE TABLE CONTACT (
    instructor_id INT NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    contact_type VARCHAR(10) NOT NULL,
    PRIMARY KEY (instructor_id, contact_no),
    FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id) ON DELETE CASCADE
);

-- ============================================
-- 7. COURSE Table
-- ============================================
CREATE TABLE COURSE (
    course_no VARCHAR(10) PRIMARY KEY,
    title VARCHAR(40) NOT NULL,
    credits INT NOT NULL,
    syllabus VARCHAR(100),
    dept_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id),
    INDEX idx_department (dept_id),
    INDEX idx_credits (credits)
);

-- ============================================
-- 8. CLASSROOM Table
-- ============================================
CREATE TABLE CLASSROOM (
    room_no VARCHAR(10) PRIMARY KEY,
    building VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    INDEX idx_capacity (capacity)
);

-- ============================================
-- 9. SEMESTER Table
-- ============================================
CREATE TABLE SEMESTER (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_name VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    start_date DATE,
    end_date DATE,
    UNIQUE KEY uk_semester (semester_name, academic_year)
);

-- ============================================
-- 10. COURSE_OFFERING Table
-- ============================================
CREATE TABLE COURSE_OFFERING (
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    timings VARCHAR(20),
    room_no VARCHAR(10),
    semester_id INT,
    instructor_id INT,
    capacity INT DEFAULT 50,
    enrolled_count INT DEFAULT 0,
    PRIMARY KEY (course_no, year, semester_no, section_no),
    FOREIGN KEY (course_no) REFERENCES COURSE(course_no) ON DELETE CASCADE,
    FOREIGN KEY (room_no) REFERENCES CLASSROOM(room_no) ON DELETE SET NULL,
    FOREIGN KEY (semester_id) REFERENCES SEMESTER(semester_id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id) ON DELETE SET NULL,
    INDEX idx_semester (semester_id),
    INDEX idx_room (room_no),
    INDEX idx_instructor (instructor_id)
);

-- ============================================
-- 11. ENROLLS Table
-- ============================================
CREATE TABLE ENROLLS (
    student_id INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    enroll_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20) DEFAULT 'Enrolled',
    PRIMARY KEY (student_id, course_no, year, semester_no, section_no),
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_course (course_no),
    INDEX idx_date (enroll_date)
);

-- ============================================
-- 12. TEACHES Table
-- ============================================
CREATE TABLE TEACHES (
    instructor_id INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    PRIMARY KEY (instructor_id, course_no, year, semester_no, section_no),
    FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id) ON DELETE CASCADE,
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no) ON DELETE CASCADE
);

-- ============================================
-- 13. PREREQUISITE Table
-- ============================================
CREATE TABLE PREREQUISITE (
    course_no VARCHAR(10) NOT NULL,
    prereq_course_no VARCHAR(10) NOT NULL,
    PRIMARY KEY (course_no, prereq_course_no),
    FOREIGN KEY (course_no) REFERENCES COURSE(course_no) ON DELETE CASCADE,
    FOREIGN KEY (prereq_course_no) REFERENCES COURSE(course_no) ON DELETE CASCADE
);

-- ============================================
-- 14. EXAM Table (No restrictive CHECK constraints)
-- ============================================
CREATE TABLE EXAM (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_type VARCHAR(20) NOT NULL,
    max_marks INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    exam_date DATE,
    duration_minutes INT DEFAULT 180,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no) ON DELETE CASCADE,
    INDEX idx_course (course_no),
    INDEX idx_date (exam_date)
);

-- ============================================
-- 15. RESULT Table
-- ============================================
CREATE TABLE RESULT (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    marks INT NOT NULL,
    grade VARCHAR(2) NOT NULL,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES EXAM(exam_id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    INDEX idx_grade (grade)
);

-- ============================================
-- 16. ADMIN Table
-- ============================================
CREATE TABLE ADMIN (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DATA (All IDs properly matched)
-- ============================================

-- Insert Admin
INSERT INTO ADMIN (username, password, name, email) VALUES
('admin', 'admin123', 'Registrar Admin', 'admin@university.edu');

-- Insert Persons
INSERT INTO PERSON (first_name, middle_name, last_name) VALUES
('Asha', NULL, 'Patil'),
('Rohit', NULL, 'Sharma'),
('Neha', 'R', 'Kulkarni'),
('Amit', NULL, 'Verma');

-- Insert Departments
INSERT INTO DEPARTMENT (dept_name) VALUES
('Computer Science'),
('Electronics'),
('Mechanical'),
('Information Technology');

-- Insert Programs
INSERT INTO PROGRAM (program_name, duration) VALUES
('BTech CSE', 4),
('BTech ECE', 4),
('BTech ME', 4),
('MTech CSE', 2);

-- Insert Students
INSERT INTO STUDENT (person_id, dob, age, program_id) VALUES
(1, '2004-05-12', 20, 1),
(2, '2003-08-21', 21, 1),
(3, '2004-01-10', 20, 2),
(4, '2003-11-30', 21, 3);

-- Insert Instructors
INSERT INTO INSTRUCTOR (person_id, title, dept_id) VALUES
(1, 'Professor', 1),
(2, 'Assistant Professor', 1),
(3, 'Associate Professor', 2),
(4, 'Professor', 3);

-- Insert Contacts
INSERT INTO CONTACT (instructor_id, contact_no, contact_type) VALUES
(1, '9876543210', 'Mobile'),
(2, '9876543211', 'Mobile'),
(3, '9876543212', 'Mobile'),
(4, '9876543213', 'Mobile');

-- Insert Courses
INSERT INTO COURSE (course_no, title, credits, syllabus, dept_id) VALUES
('CS101', 'Database Management Systems', 4, 'ER Diagrams, SQL, Normalization', 1),
('CS102', 'Operating Systems', 4, 'Processes, Memory Management, File Systems', 1),
('CS103', 'Data Structures', 4, 'Arrays, Linked Lists, Trees, Graphs', 1),
('EC101', 'Digital Electronics', 3, 'Logic Gates, Flip Flops, Counters', 2),
('EC102', 'Signals and Systems', 3, 'Continuous/Discrete Signals, Fourier Analysis', 2),
('ME101', 'Thermodynamics', 3, 'Laws of Thermodynamics, Energy Systems', 3),
('ME102', 'Fluid Mechanics', 3, 'Fluid Properties, Bernoulli Equation', 3),
('IT101', 'Web Technologies', 4, 'HTML, CSS, JavaScript, React', 4);

-- Insert Classrooms
INSERT INTO CLASSROOM (room_no, building, capacity) VALUES
('C101', 'Main Block', 60),
('C102', 'Main Block', 50),
('C103', 'Main Block', 45),
('E201', 'Electronics Block', 40),
('E202', 'Electronics Block', 35),
('M301', 'Mechanical Block', 45),
('M302', 'Mechanical Block', 40),
('IT401', 'IT Block', 55);

-- Insert Semesters
INSERT INTO SEMESTER (semester_name, academic_year, start_date, end_date) VALUES
('Odd', '2024-25', '2024-07-15', '2024-12-15'),
('Even', '2024-25', '2025-01-02', '2025-05-30'),
('Odd', '2025-26', '2025-07-15', '2025-12-15'),
('Even', '2025-26', '2026-01-02', '2026-05-30');

-- Insert Course Offerings
INSERT INTO COURSE_OFFERING (course_no, year, semester_no, section_no, timings, room_no, semester_id, instructor_id, capacity, enrolled_count) VALUES
('CS101', 2024, 1, 1, '10:00-11:00', 'C101', 1, 1, 60, 2),
('CS101', 2024, 1, 2, '11:00-12:00', 'C102', 1, 1, 50, 0),
('CS102', 2024, 1, 1, '11:00-12:00', 'C103', 1, 2, 45, 0),
('EC101', 2024, 1, 1, '09:00-10:00', 'E201', 1, 3, 40, 1),
('EC101', 2024, 1, 2, '14:00-15:00', 'E202', 1, 3, 35, 0),
('ME101', 2024, 1, 1, '14:00-15:00', 'M301', 1, 4, 45, 1),
('ME101', 2024, 1, 2, '15:00-16:00', 'M302', 1, 4, 40, 0),
('IT101', 2024, 1, 1, '10:00-11:00', 'IT401', 1, 1, 55, 0);

-- Insert Enrollments
INSERT INTO ENROLLS (student_id, course_no, year, semester_no, section_no, enroll_date, status) VALUES
(1, 'CS101', 2024, 1, 1, '2024-07-01', 'Enrolled'),
(2, 'CS101', 2024, 1, 1, '2024-07-01', 'Enrolled'),
(3, 'EC101', 2024, 1, 1, '2024-07-02', 'Enrolled'),
(4, 'ME101', 2024, 1, 1, '2024-07-03', 'Enrolled');

-- Insert Teaches
INSERT INTO TEACHES (instructor_id, course_no, year, semester_no, section_no) VALUES
(1, 'CS101', 2024, 1, 1),
(1, 'CS101', 2024, 1, 2),
(2, 'CS102', 2024, 1, 1),
(3, 'EC101', 2024, 1, 1),
(3, 'EC101', 2024, 1, 2),
(4, 'ME101', 2024, 1, 1),
(4, 'ME101', 2024, 1, 2),
(1, 'IT101', 2024, 1, 1);

-- Insert Prerequisites
INSERT INTO PREREQUISITE (course_no, prereq_course_no) VALUES
('CS102', 'CS101'),
('CS103', 'CS101'),
('EC102', 'EC101'),
('ME102', 'ME101');

-- Insert Exams (Using flexible exam_type values)
INSERT INTO EXAM (exam_type, max_marks, course_no, year, semester_no, section_no, exam_date, duration_minutes) VALUES
-- CS101 Exams
('Quiz 1', 10, 'CS101', 2024, 1, 1, '2024-08-10', 30),
('Quiz 2', 10, 'CS101', 2024, 1, 1, '2024-09-05', 30),
('Mid', 30, 'CS101', 2024, 1, 1, '2024-09-20', 120),
('Assignment', 20, 'CS101', 2024, 1, 1, '2024-10-15', 0),
('End', 70, 'CS101', 2024, 1, 1, '2024-11-25', 180),

-- EC101 Exams
('Quiz', 10, 'EC101', 2024, 1, 1, '2024-08-15', 30),
('Mid', 30, 'EC101', 2024, 1, 1, '2024-09-25', 120),
('Assignment', 15, 'EC101', 2024, 1, 1, '2024-10-20', 0),
('End', 70, 'EC101', 2024, 1, 1, '2024-11-28', 180),

-- ME101 Exams
('Quiz', 10, 'ME101', 2024, 1, 1, '2024-08-20', 30),
('Mid', 30, 'ME101', 2024, 1, 1, '2024-09-28', 120),
('Assignment', 15, 'ME101', 2024, 1, 1, '2024-10-25', 0),
('End', 70, 'ME101', 2024, 1, 1, '2024-12-02', 180),

-- CS102 Exams
('Quiz', 10, 'CS102', 2024, 1, 1, '2024-08-12', 30),
('Mid', 30, 'CS102', 2024, 1, 1, '2024-09-22', 120),
('End', 70, 'CS102', 2024, 1, 1, '2024-11-27', 180),

-- IT101 Exams
('Quiz', 10, 'IT101', 2024, 1, 1, '2024-08-18', 30),
('Mid', 30, 'IT101', 2024, 1, 1, '2024-09-30', 120),
('End', 70, 'IT101', 2024, 1, 1, '2024-12-05', 180);

-- Insert Results
INSERT INTO RESULT (marks, grade, student_id, exam_id) VALUES
-- Student 1 (Asha) - CS101 Results
(9, 'A', 1, 1),
(10, 'A+', 1, 2),
(28, 'A+', 1, 3),
(19, 'A', 1, 4),
(68, 'A+', 1, 5),

-- Student 2 (Rohit) - CS101 Results
(8, 'B+', 2, 1),
(9, 'A', 2, 2),
(25, 'A', 2, 3),
(16, 'B+', 2, 4),
(60, 'B+', 2, 5),

-- Student 3 (Neha) - EC101 Results
(9, 'A', 3, 6),
(28, 'A+', 3, 7),
(14, 'A', 3, 8),
(65, 'A+', 3, 9),

-- Student 4 (Amit) - ME101 Results
(8, 'B+', 4, 10),
(26, 'A', 4, 11),
(12, 'B+', 4, 12),
(58, 'B+', 4, 13);

-- Update enrolled counts
UPDATE COURSE_OFFERING SET enrolled_count = 2 WHERE course_no = 'CS101' AND year = 2024 AND semester_no = 1 AND section_no = 1;
UPDATE COURSE_OFFERING SET enrolled_count = 1 WHERE course_no = 'EC101' AND year = 2024 AND semester_no = 1 AND section_no = 1;
UPDATE COURSE_OFFERING SET enrolled_count = 1 WHERE course_no = 'ME101' AND year = 2024 AND semester_no = 1 AND section_no = 1;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Student Details View
CREATE VIEW vw_student_details AS
SELECT 
    s.student_id,
    p.first_name,
    p.middle_name,
    p.last_name,
    CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name) AS full_name,
    s.dob,
    s.age,
    pr.program_name,
    pr.duration,
    s.enrollment_date
FROM STUDENT s
JOIN PERSON p ON s.person_id = p.person_id
JOIN PROGRAM pr ON s.program_id = pr.program_id;

-- Student Results View
CREATE VIEW vw_student_results AS
SELECT 
    s.student_id,
    p.first_name,
    p.last_name,
    e.exam_id,
    e.exam_type,
    e.course_no,
    c.title AS course_title,
    r.marks,
    e.max_marks,
    r.grade,
    ROUND((r.marks * 100.0 / e.max_marks), 2) AS percentage
FROM RESULT r
JOIN STUDENT s ON r.student_id = s.student_id
JOIN PERSON p ON s.person_id = p.person_id
JOIN EXAM e ON r.exam_id = e.exam_id
JOIN COURSE c ON e.course_no = c.course_no;

-- Student Performance Summary View
CREATE VIEW vw_student_performance AS
SELECT 
    student_id,
    first_name,
    last_name,
    COUNT(DISTINCT exam_id) AS total_exams,
    SUM(marks) AS total_marks_obtained,
    SUM(max_marks) AS total_max_marks,
    ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) AS overall_percentage,
    CASE 
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 90 THEN 'A+'
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 80 THEN 'A'
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 70 THEN 'B+'
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 60 THEN 'B'
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 50 THEN 'C'
        WHEN ROUND((SUM(marks) * 100.0 / SUM(max_marks)), 2) >= 40 THEN 'D'
        ELSE 'F'
    END AS overall_grade
FROM vw_student_results
GROUP BY student_id, first_name, last_name;

-- Course Enrollment Summary View
CREATE VIEW vw_course_enrollment AS
SELECT 
    c.course_no,
    c.title,
    c.credits,
    d.dept_name,
    COUNT(e.student_id) AS enrolled_students,
    co.capacity,
    ROUND((COUNT(e.student_id) * 100.0 / NULLIF(co.capacity, 0)), 2) AS fill_percentage
FROM COURSE c
JOIN DEPARTMENT d ON c.dept_id = d.dept_id
LEFT JOIN COURSE_OFFERING co ON c.course_no = co.course_no
LEFT JOIN ENROLLS e ON c.course_no = e.course_no AND e.status = 'Enrolled'
GROUP BY c.course_no, c.title, c.credits, d.dept_name, co.capacity;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Get Complete Student Report
DELIMITER //
CREATE PROCEDURE sp_get_student_report(IN p_student_id INT)
BEGIN
    SELECT * FROM vw_student_details WHERE student_id = p_student_id;
    SELECT * FROM vw_student_results WHERE student_id = p_student_id ORDER BY exam_id;
    SELECT * FROM vw_student_performance WHERE student_id = p_student_id;
END//
DELIMITER ;

-- Get Course Statistics
DELIMITER //
CREATE PROCEDURE sp_get_course_stats(IN p_course_no VARCHAR(10))
BEGIN
    SELECT * FROM vw_course_enrollment WHERE course_no = p_course_no;
    
    SELECT 
        e.exam_type,
        COUNT(r.result_id) AS results_count,
        AVG(r.marks) AS avg_marks,
        MAX(r.marks) AS max_marks,
        MIN(r.marks) AS min_marks
    FROM EXAM e
    LEFT JOIN RESULT r ON e.exam_id = r.exam_id
    WHERE e.course_no = p_course_no
    GROUP BY e.exam_id, e.exam_type;
END//
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-calculate age before insert
DELIMITER //
CREATE TRIGGER trg_calculate_age_insert
BEFORE INSERT ON STUDENT
FOR EACH ROW
BEGIN
    DECLARE v_age INT;
    SET v_age = YEAR(CURDATE()) - YEAR(NEW.dob);
    IF (MONTH(CURDATE()) < MONTH(NEW.dob)) OR 
       (MONTH(CURDATE()) = MONTH(NEW.dob) AND DAY(CURDATE()) < DAY(NEW.dob)) THEN
        SET v_age = v_age - 1;
    END IF;
    SET NEW.age = v_age;
END//
DELIMITER ;

-- Update enrolled count on enrollment
DELIMITER //
CREATE TRIGGER trg_update_enrolled_insert
AFTER INSERT ON ENROLLS
FOR EACH ROW
BEGIN
    UPDATE COURSE_OFFERING 
    SET enrolled_count = enrolled_count + 1
    WHERE course_no = NEW.course_no 
      AND year = NEW.year 
      AND semester_no = NEW.semester_no 
      AND section_no = NEW.section_no;
END//
DELIMITER ;

-- Update enrolled count on deletion
DELIMITER //
CREATE TRIGGER trg_update_enrolled_delete
AFTER DELETE ON ENROLLS
FOR EACH ROW
BEGIN
    UPDATE COURSE_OFFERING 
    SET enrolled_count = GREATEST(enrolled_count - 1, 0)
    WHERE course_no = OLD.course_no 
      AND year = OLD.year 
      AND semester_no = OLD.semester_no 
      AND section_no = OLD.section_no;
END//
DELIMITER ;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check record counts
SELECT '=== DATABASE VERIFICATION ===' AS '';
SELECT 'PERSON' AS Table_Name, COUNT(*) AS Count FROM PERSON UNION
SELECT 'DEPARTMENT', COUNT(*) FROM DEPARTMENT UNION
SELECT 'PROGRAM', COUNT(*) FROM PROGRAM UNION
SELECT 'STUDENT', COUNT(*) FROM STUDENT UNION
SELECT 'INSTRUCTOR', COUNT(*) FROM INSTRUCTOR UNION
SELECT 'COURSE', COUNT(*) FROM COURSE UNION
SELECT 'CLASSROOM', COUNT(*) FROM CLASSROOM UNION
SELECT 'SEMESTER', COUNT(*) FROM SEMESTER UNION
SELECT 'COURSE_OFFERING', COUNT(*) FROM COURSE_OFFERING UNION
SELECT 'ENROLLS', COUNT(*) FROM ENROLLS UNION
SELECT 'TEACHES', COUNT(*) FROM TEACHES UNION
SELECT 'PREREQUISITE', COUNT(*) FROM PREREQUISITE UNION
SELECT 'EXAM', COUNT(*) FROM EXAM UNION
SELECT 'RESULT', COUNT(*) FROM RESULT UNION
SELECT 'ADMIN', COUNT(*) FROM ADMIN;

-- Display sample data
SELECT '=== SAMPLE STUDENTS ===' AS '';
SELECT * FROM vw_student_details;

SELECT '=== STUDENT PERFORMANCE ===' AS '';
SELECT * FROM vw_student_performance;

SELECT '=== COURSE ENROLLMENTS ===' AS '';
SELECT * FROM vw_course_enrollment;

-- ============================================
-- END OF SCRIPT
-- ============================================