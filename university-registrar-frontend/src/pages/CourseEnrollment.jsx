import React, { useState, useEffect } from 'react';
import { 
    UserPlus, 
    Search, 
    Filter, 
    X, 
    CheckCircle, 
    AlertCircle,
    BookOpen,
    User,
    Calendar,
    Clock,
    Trash2,
    RefreshCw,
    Download,
    Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const CourseEnrollment = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [courseOfferings, setCourseOfferings] = useState([]);
    const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes, enrollmentsRes, offeringsRes] = await Promise.all([
                api.get('/students'),
                api.get('/courses'),
                api.get('/enrollments/all'),
                api.get('/course-offerings')
            ]);
            setStudents(studentsRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setEnrollments(enrollmentsRes.data.data || []);
            setCourseOfferings(offeringsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error loading enrollment data');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedCourse || !selectedSection) {
            toast.error('Please select student, course, and section');
            return;
        }

        const offering = courseOfferings.find(
            o => o.course_no === selectedCourse && o.section_no === parseInt(selectedSection)
        );

        if (!offering) {
            toast.error('Course offering not found');
            return;
        }

        setLoading(true);
        try {
            await api.post('/enrollments', {
                student_id: selectedStudent.student_id,
                course_no: selectedCourse,
                year: offering.year,
                semester_no: offering.semester_no,
                section_no: offering.section_no,
                enroll_date: enrollmentDate
            });
            
            toast.success(`${selectedStudent.first_name} ${selectedStudent.last_name} enrolled in ${selectedCourse}!`);
            setShowModal(false);
            setSelectedStudent(null);
            setSelectedCourse('');
            setSelectedSection('');
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Enrollment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDropEnrollment = async (enrollment) => {
        if (window.confirm(`Remove ${enrollment.student_name} from ${enrollment.course_no}?`)) {
            setLoading(true);
            try {
                await api.delete('/enrollments', {
                    data: {
                        student_id: enrollment.student_id,
                        course_no: enrollment.course_no,
                        year: enrollment.year,
                        semester_no: enrollment.semester_no,
                        section_no: enrollment.section_no
                    }
                });
                toast.success('Enrollment removed successfully');
                fetchAllData();
            } catch (error) {
                toast.error('Error removing enrollment');
            } finally {
                setLoading(false);
            }
        }
    };

    const getAvailableCourses = () => {
        if (!selectedStudent) return [];
        
        const enrolledCourses = enrollments
            .filter(e => e.student_id === selectedStudent.student_id)
            .map(e => e.course_no);
        
        return courses.filter(c => !enrolledCourses.includes(c.course_no));
    };

    const getAvailableSections = () => {
        if (!selectedCourse) return [];
        return courseOfferings.filter(o => o.course_no === selectedCourse);
    };

    const filteredEnrollments = enrollments.filter(enrollment => {
        let matchesSearch = true;
        let matchesCourse = true;
        
        if (searchTerm) {
            matchesSearch = 
                enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.course_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        if (filterCourse !== 'all') {
            matchesCourse = enrollment.course_no === filterCourse;
        }
        
        return matchesSearch && matchesCourse;
    });

    if (loading && enrollments.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Course Enrollment
                        </h1>
                        <p className="text-gray-500 mt-1">Enroll students in courses and manage registrations</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                    >
                        <UserPlus size={18} />
                        <span>New Enrollment</span>
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Students</p>
                                <p className="text-2xl font-bold">{students.length}</p>
                            </div>
                            <User size={28} className="opacity-80" />
                        </div>
                    </div>
                    <div className="card p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Courses</p>
                                <p className="text-2xl font-bold">{courses.length}</p>
                            </div>
                            <BookOpen size={28} className="opacity-80" />
                        </div>
                    </div>
                    <div className="card p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Enrollments</p>
                                <p className="text-2xl font-bold">{enrollments.length}</p>
                            </div>
                            <UserPlus size={28} className="opacity-80" />
                        </div>
                    </div>
                    <div className="card p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg per Course</p>
                                <p className="text-2xl font-bold">
                                    {courses.length ? (enrollments.length / courses.length).toFixed(1) : 0}
                                </p>
                            </div>
                            <Users size={28} className="opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by student name or course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <div className="w-64">
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.course_no} value={course.course_no}>
                                        {course.course_no} - {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={fetchAllData} className="btn-secondary">
                            <RefreshCw size={18} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Enrollments Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Student</th>
                                    <th className="table-header">Course</th>
                                    <th className="table-header">Section</th>
                                    <th className="table-header">Year/Semester</th>
                                    <th className="table-header">Enrollment Date</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEnrollments.map((enrollment, index) => (
                                    <tr key={`${enrollment.student_id}-${enrollment.course_no}-${index}`} className="table-row">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span className="font-medium">{enrollment.student_name}</span>
                                                <span className="text-xs text-gray-400">(ID: {enrollment.student_id})</span>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div>
                                                <p className="font-medium">{enrollment.course_no}</p>
                                                <p className="text-xs text-gray-500">{enrollment.course_title}</p>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-info">Section {enrollment.section_no}</span>
                                        </td>
                                        <td className="table-cell">{enrollment.year} - Sem {enrollment.semester_no}</td>
                                        <td className="table-cell">{new Date(enrollment.enroll_date).toLocaleDateString()}</td>
                                        <td className="table-cell">
                                            <span className="badge badge-success">{enrollment.status}</span>
                                        </td>
                                        <td className="table-cell">
                                            <button
                                                onClick={() => handleDropEnrollment(enrollment)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Drop Course"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEnrollments.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-400">
                                            No enrollments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enrollment Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                        <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">New Course Enrollment</h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Student Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student *</label>
                                        <select
                                            value={selectedStudent?.student_id || ''}
                                            onChange={(e) => {
                                                const student = students.find(s => s.student_id === parseInt(e.target.value));
                                                setSelectedStudent(student);
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="">-- Select Student --</option>
                                            {students.map(student => (
                                                <option key={student.student_id} value={student.student_id}>
                                                    {student.first_name} {student.last_name} (ID: {student.student_id}) - {student.program_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Course Selection */}
                                    {selectedStudent && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course *</label>
                                            <select
                                                value={selectedCourse}
                                                onChange={(e) => {
                                                    setSelectedCourse(e.target.value);
                                                    setSelectedSection('');
                                                }}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                required
                                            >
                                                <option value="">-- Select Course --</option>
                                                {getAvailableCourses().map(course => (
                                                    <option key={course.course_no} value={course.course_no}>
                                                        {course.course_no} - {course.title} ({course.credits} credits)
                                                    </option>
                                                ))}
                                            </select>
                                            {getAvailableCourses().length === 0 && (
                                                <p className="text-sm text-yellow-600 mt-1">
                                                    Student is already enrolled in all available courses
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Section Selection */}
                                    {selectedCourse && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Section *</label>
                                            <select
                                                value={selectedSection}
                                                onChange={(e) => setSelectedSection(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                required
                                            >
                                                <option value="">-- Select Section --</option>
                                                {getAvailableSections().map(offering => (
                                                    <option key={offering.section_no} value={offering.section_no}>
                                                        Section {offering.section_no} - {offering.timings} ({offering.room_no}) 
                                                        [{offering.enrolled_count}/{offering.capacity} seats]
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Enrollment Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment Date</label>
                                        <input
                                            type="date"
                                            value={enrollmentDate}
                                            onChange={(e) => setEnrollmentDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    {/* Selected Course Details */}
                                    {selectedCourse && selectedSection && (
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-blue-800 mb-2">Course Details</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Course:</span>
                                                    <span className="ml-2 font-medium">{selectedCourse}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Section:</span>
                                                    <span className="ml-2 font-medium">{selectedSection}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Timings:</span>
                                                    <span className="ml-2">
                                                        {getAvailableSections().find(o => o.section_no === parseInt(selectedSection))?.timings}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Room:</span>
                                                    <span className="ml-2">
                                                        {getAvailableSections().find(o => o.section_no === parseInt(selectedSection))?.room_no}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleEnroll} 
                                            disabled={loading || !selectedStudent || !selectedCourse || !selectedSection}
                                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><UserPlus size={18} /> Enroll Student</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseEnrollment;