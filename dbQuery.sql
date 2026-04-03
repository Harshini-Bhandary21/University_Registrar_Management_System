-- Create database
CREATE DATABASE university_registrar;
USE university_registrar;

-- PERSON Table
CREATE TABLE PERSON (
    person_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(20),
    last_name VARCHAR(20) NOT NULL
);

-- DEPARTMENT Table
CREATE TABLE DEPARTMENT (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL UNIQUE
);

-- PROGRAM Table
CREATE TABLE PROGRAM (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(30) NOT NULL,
    duration INT NOT NULL
);

-- STUDENT Table
CREATE TABLE STUDENT (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    dob DATE NOT NULL,
    age INT,
    program_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES PROGRAM(program_id)
);

-- INSTRUCTOR Table
CREATE TABLE INSTRUCTOR (
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,
    person_id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    dept_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);

-- CONTACT Table
CREATE TABLE CONTACT (
    instructor_id INT NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    contact_type VARCHAR(10) NOT NULL,
    PRIMARY KEY (instructor_id, contact_no),
    FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id) ON DELETE CASCADE
);

-- COURSE Table
CREATE TABLE COURSE (
    course_no VARCHAR(10) PRIMARY KEY,
    title VARCHAR(40) NOT NULL,
    credits INT NOT NULL,
    syllabus VARCHAR(100),
    dept_id INT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);

-- CLASSROOM Table
CREATE TABLE CLASSROOM (
    room_no VARCHAR(10) PRIMARY KEY,
    building VARCHAR(20) NOT NULL,
    capacity INT NOT NULL
);

-- SEMESTER Table
CREATE TABLE SEMESTER (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_name VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL
);

-- COURSE_OFFERING Table
CREATE TABLE COURSE_OFFERING (
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    timings VARCHAR(20),
    room_no VARCHAR(10),
    semester_id INT,
    PRIMARY KEY (course_no, year, semester_no, section_no),
    FOREIGN KEY (course_no) REFERENCES COURSE(course_no),
    FOREIGN KEY (room_no) REFERENCES CLASSROOM(room_no),
    FOREIGN KEY (semester_id) REFERENCES SEMESTER(semester_id)
);

-- ENROLLS Table
CREATE TABLE ENROLLS (
    student_id INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    enroll_date DATE,
    PRIMARY KEY (student_id, course_no, year, semester_no, section_no),
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id),
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no)
);

-- TEACHES Table
CREATE TABLE TEACHES (
    instructor_id INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    PRIMARY KEY (instructor_id, course_no, year, semester_no, section_no),
    FOREIGN KEY (instructor_id) REFERENCES INSTRUCTOR(instructor_id),
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no)
);

-- PREREQUISITE Table
CREATE TABLE PREREQUISITE (
    course_no VARCHAR(10) NOT NULL,
    prereq_course_no VARCHAR(10) NOT NULL,
    PRIMARY KEY (course_no, prereq_course_no),
    FOREIGN KEY (course_no) REFERENCES COURSE(course_no),
    FOREIGN KEY (prereq_course_no) REFERENCES COURSE(course_no)
);

-- EXAM Table
CREATE TABLE EXAM (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_type VARCHAR(15) NOT NULL,
    max_marks INT NOT NULL,
    course_no VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    semester_no INT NOT NULL,
    section_no INT NOT NULL,
    FOREIGN KEY (course_no, year, semester_no, section_no) 
        REFERENCES COURSE_OFFERING(course_no, year, semester_no, section_no)
);

-- RESULT Table
CREATE TABLE RESULT (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    marks INT NOT NULL,
    grade VARCHAR(2) NOT NULL,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id),
    FOREIGN KEY (exam_id) REFERENCES EXAM(exam_id)
);

-- Insert sample data
INSERT INTO PERSON (first_name, middle_name, last_name) VALUES
('Asha', NULL, 'Patil'),
('Rohit', NULL, 'Sharma'),
('Neha', 'R', 'Kulkarni'),
('Amit', NULL, 'Verma');

INSERT INTO DEPARTMENT (dept_name) VALUES
('Computer Science'),
('Electronics'),
('Mechanical'),
('Information Technology');

INSERT INTO PROGRAM (program_name, duration) VALUES
('BTech CSE', 4),
('BTech ECE', 4),
('BTech ME', 4),
('MTech CSE', 2);

INSERT INTO STUDENT (person_id, dob, age, program_id) VALUES
(1, '2004-05-12', 20, 1),
(2, '2003-08-21', 21, 1),
(3, '2004-01-10', 20, 2),
(4, '2003-11-30', 21, 3);

INSERT INTO INSTRUCTOR (person_id, title, dept_id) VALUES
(1, 'Professor', 1),
(2, 'Asst Professor', 1),
(3, 'Assoc Professor', 2),
(4, 'Professor', 3);

INSERT INTO COURSE VALUES
('CS101', 'DBMS', 4, 'ER and SQL', 1),
('CS102', 'OS', 4, 'Processes', 1),
('EC101', 'Digital', 3, 'Logic Gates', 2),
('ME101', 'Thermodynamics', 3, 'Energy Systems', 3);

INSERT INTO CLASSROOM VALUES
('C101', 'Main Block', 60),
('C102', 'Main Block', 50),
('E201', 'Electronics', 40),
('M301', 'Mechanical', 45);

INSERT INTO SEMESTER (semester_name, academic_year) VALUES
('Odd', '2024-25'),
('Even', '2024-25'),
('Odd', '2025-26'),
('Even', '2025-26');