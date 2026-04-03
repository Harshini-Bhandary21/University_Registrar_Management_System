import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    BookOpen, 
    Plus, 
    Edit, 
    Trash2, 
    Eye,
    Save,
    X,
    RefreshCw,
    FileText,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({
        exam_type: 'Mid',
        max_marks: 30,
        course_no: '',
        year: new Date().getFullYear(),
        semester_no: 1,
        section_no: 1
    });

    useEffect(() => {
        fetchExams();
        fetchCourses();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const response = await api.get('/exams');
            setExams(response.data.data);
        } catch (error) {
            toast.error('Error fetching exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingExam) {
                await api.put(`/exams/${editingExam.exam_id}`, formData);
                toast.success('Exam updated successfully!');
            } else {
                await api.post('/exams', formData);
                toast.success('Exam created successfully!');
            }
            setShowModal(false);
            setEditingExam(null);
            setFormData({
                exam_type: 'Mid',
                max_marks: 30,
                course_no: '',
                year: new Date().getFullYear(),
                semester_no: 1,
                section_no: 1
            });
            fetchExams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving exam');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (exam) => {
        if (window.confirm(`Delete exam for ${exam.course_title}?`)) {
            try {
                await api.delete(`/exams/${exam.exam_id}`);
                toast.success('Exam deleted successfully!');
                fetchExams();
            } catch (error) {
                toast.error('Error deleting exam');
            }
        }
    };

    const handleEdit = (exam) => {
        setEditingExam(exam);
        setFormData({
            exam_type: exam.exam_type,
            max_marks: exam.max_marks,
            course_no: exam.course_no,
            year: exam.year,
            semester_no: exam.semester_no,
            section_no: exam.section_no
        });
        setShowModal(true);
    };

    const examTypes = ['Mid', 'End', 'Quiz', 'Assignment', 'Practical', 'Final'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const sections = [1, 2, 3, 4];

    if (loading && exams.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Exam Management
                        </h1>
                        <p className="text-gray-500 mt-1">Create and manage examinations</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingExam(null);
                            setFormData({
                                exam_type: 'Mid',
                                max_marks: 30,
                                course_no: '',
                                year: new Date().getFullYear(),
                                semester_no: 1,
                                section_no: 1
                            });
                            setShowModal(true);
                        }}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        <span>Create Exam</span>
                    </button>
                </div>

                {/* Exams Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Exam ID</th>
                                    <th className="table-header">Course</th>
                                    <th className="table-header">Exam Type</th>
                                    <th className="table-header">Max Marks</th>
                                    <th className="table-header">Year/Semester</th>
                                    <th className="table-header">Section</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam) => (
                                    <tr key={exam.exam_id} className="table-row">
                                        <td className="table-cell font-medium">{exam.exam_id}</td>
                                        <td className="table-cell">
                                            <div>
                                                <p className="font-medium">{exam.course_title}</p>
                                                <p className="text-xs text-gray-500">{exam.course_no}</p>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${
                                                exam.exam_type === 'Mid' ? 'badge-info' :
                                                exam.exam_type === 'End' ? 'badge-success' :
                                                exam.exam_type === 'Quiz' ? 'badge-warning' : 'badge-purple'
                                            }`}>
                                                {exam.exam_type}
                                            </span>
                                        </td>
                                        <td className="table-cell font-semibold">{exam.max_marks}</td>
                                        <td className="table-cell">{exam.year} - Sem {exam.semester_no}</td>
                                        <td className="table-cell">Section {exam.section_no}</td>
                                        <td className="table-cell">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(exam)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {exams.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-400">
                                            No exams found. Create your first exam!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingExam ? 'Edit Exam' : 'Create New Exam'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="input-label">Course *</label>
                                        <select
                                            value={formData.course_no}
                                            onChange={(e) => setFormData({...formData, course_no: e.target.value})}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course.course_no} value={course.course_no}>
                                                    {course.course_no} - {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Exam Type *</label>
                                        <select
                                            value={formData.exam_type}
                                            onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                                            className="input-field"
                                            required
                                        >
                                            {examTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Maximum Marks *</label>
                                        <input
                                            type="number"
                                            value={formData.max_marks}
                                            onChange={(e) => setFormData({...formData, max_marks: parseInt(e.target.value)})}
                                            className="input-field"
                                            required
                                            min="1"
                                            max="100"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Year *</label>
                                            <input
                                                type="number"
                                                value={formData.year}
                                                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Semester *</label>
                                            <select
                                                value={formData.semester_no}
                                                onChange={(e) => setFormData({...formData, semester_no: parseInt(e.target.value)})}
                                                className="input-field"
                                                required
                                            >
                                                {semesters.map(sem => (
                                                    <option key={sem} value={sem}>Semester {sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Section *</label>
                                        <select
                                            value={formData.section_no}
                                            onChange={(e) => setFormData({...formData, section_no: parseInt(e.target.value)})}
                                            className="input-field"
                                            required
                                        >
                                            {sections.map(section => (
                                                <option key={section} value={section}>Section {section}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="btn-primary">
                                            {loading ? <div className="spinner-sm"></div> : <><Save size={18} /> Save Exam</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamManagement;