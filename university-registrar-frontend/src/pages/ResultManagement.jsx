import React, { useState, useEffect } from 'react';
import { 
    Award, 
    Plus, 
    Edit, 
    Trash2, 
    Save,
    X,
    Upload,
    Download,
    Search,
    User,
    BookOpen,
    TrendingUp,
    CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ResultManagement = () => {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [selectedExam, setSelectedExam] = useState('');
    const [examResults, setExamResults] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkData, setBulkData] = useState([]);
    const [formData, setFormData] = useState({
        student_id: '',
        exam_id: '',
        marks: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [resultsRes, examsRes, studentsRes] = await Promise.all([
                api.get('/results/all'),
                api.get('/exams'),
                api.get('/students')
            ]);
            setResults(resultsRes.data.data);
            setExams(examsRes.data.data);
            setStudents(studentsRes.data.data);
        } catch (error) {
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const fetchExamResults = async (examId) => {
        if (!examId) return;
        setLoading(true);
        try {
            const response = await api.get(`/results/exam/${examId}`);
            setExamResults(response.data.data);
            setSelectedExam(examId);
        } catch (error) {
            toast.error('Error fetching exam results');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/results', formData);
            toast.success(editingResult ? 'Result updated!' : 'Result added!');
            setShowModal(false);
            setEditingResult(null);
            setFormData({ student_id: '', exam_id: '', marks: '' });
            fetchInitialData();
            if (selectedExam) fetchExamResults(selectedExam);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving result');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (result) => {
        if (window.confirm('Delete this result?')) {
            try {
                await api.delete(`/results/${result.result_id}`);
                toast.success('Result deleted!');
                fetchInitialData();
                if (selectedExam) fetchExamResults(selectedExam);
            } catch (error) {
                toast.error('Error deleting result');
            }
        }
    };

    const handleBulkUpload = async () => {
        if (bulkData.length === 0) {
            toast.error('No data to upload');
            return;
        }
        
        setLoading(true);
        try {
            const response = await api.post('/results/bulk', { results: bulkData });
            toast.success(response.data.message);
            setBulkData([]);
            setBulkMode(false);
            fetchInitialData();
            if (selectedExam) fetchExamResults(selectedExam);
        } catch (error) {
            toast.error('Error during bulk upload');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (result) => {
        setEditingResult(result);
        setFormData({
            student_id: result.student_id,
            exam_id: result.exam_id,
            marks: result.marks
        });
        setShowModal(true);
    };

    const getGradeColor = (grade) => {
        if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-50';
        if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-50';
        if (grade === 'C') return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    if (loading && results.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Result Management
                        </h1>
                        <p className="text-gray-500 mt-1">Add, edit, and manage student exam results</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setBulkMode(!bulkMode)}
                            className="btn-secondary"
                        >
                            <Upload size={18} />
                            <span>Bulk Upload</span>
                        </button>
                        <button
                            onClick={() => {
                                setEditingResult(null);
                                setFormData({ student_id: '', exam_id: '', marks: '' });
                                setShowModal(true);
                            }}
                            className="btn-primary"
                        >
                            <Plus size={18} />
                            <span>Add Result</span>
                        </button>
                    </div>
                </div>

                {/* Exam Filter */}
                <div className="card p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="font-medium text-gray-700">Filter by Exam:</label>
                        <select
                            value={selectedExam}
                            onChange={(e) => fetchExamResults(e.target.value)}
                            className="input-field w-64"
                        >
                            <option value="">All Exams</option>
                            {exams.map(exam => (
                                <option key={exam.exam_id} value={exam.exam_id}>
                                    {exam.course_title} - {exam.exam_type} ({exam.year})
                                </option>
                            ))}
                        </select>
                        {selectedExam && (
                            <button
                                onClick={() => setSelectedExam('')}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk Upload Mode */}
                {bulkMode && (
                    <div className="card p-6 mb-6 bg-blue-50 border-2 border-blue-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Upload size={20} className="text-blue-600" />
                                Bulk Upload Results
                            </h3>
                            <button onClick={() => setBulkMode(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Format: student_id, exam_id, marks (one per line)
                            <br />
                            Example: 201, 401, 25
                        </p>
                        <textarea
                            placeholder="201, 401, 25&#10;202, 401, 28&#10;203, 402, 22"
                            value={bulkData.map(d => `${d.student_id}, ${d.exam_id}, ${d.marks}`).join('\n')}
                            onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                const parsed = [];
                                for (const line of lines) {
                                    const parts = line.split(',').map(p => p.trim());
                                    if (parts.length >= 3) {
                                        parsed.push({
                                            student_id: parseInt(parts[0]),
                                            exam_id: parseInt(parts[1]),
                                            marks: parseInt(parts[2])
                                        });
                                    }
                                }
                                setBulkData(parsed);
                            }}
                            className="input-field font-mono text-sm h-48"
                        />
                        <div className="flex justify-end mt-4">
                            <button onClick={handleBulkUpload} className="btn-primary">
                                <Upload size={18} /> Upload {bulkData.length} Records
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Student</th>
                                    <th className="table-header">Course</th>
                                    <th className="table-header">Exam</th>
                                    <th className="table-header">Marks</th>
                                    <th className="table-header">Grade</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedExam ? examResults : results).map((result) => (
                                    <tr key={result.result_id} className="table-row">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span>{result.first_name} {result.last_name}</span>
                                                <span className="text-xs text-gray-400">(ID: {result.student_id})</span>
                                            </div>
                                        </td>
                                        <td className="table-cell">{result.course_title || result.course_no}</td>
                                        <td className="table-cell">
                                            <span className="badge badge-info">{result.exam_type}</span>
                                        </td>
                                        <td className="table-cell font-semibold">
                                            {result.marks} / {result.max_marks}
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${getGradeColor(result.grade)}`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(result)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(result)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(selectedExam ? examResults : results).length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            No results found. Add some results!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingResult ? 'Edit Result' : 'Add New Result'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="input-label">Student *</label>
                                        <select
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select Student</option>
                                            {students.map(student => (
                                                <option key={student.student_id} value={student.student_id}>
                                                    {student.first_name} {student.last_name} (ID: {student.student_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Exam *</label>
                                        <select
                                            value={formData.exam_id}
                                            onChange={(e) => setFormData({...formData, exam_id: e.target.value})}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select Exam</option>
                                            {exams.map(exam => (
                                                <option key={exam.exam_id} value={exam.exam_id}>
                                                    {exam.course_title} - {exam.exam_type} (Max: {exam.max_marks})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Marks Obtained *</label>
                                        <input
                                            type="number"
                                            value={formData.marks}
                                            onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                                            className="input-field"
                                            required
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="btn-primary">
                                            {loading ? <div className="spinner-sm"></div> : <><Save size={18} /> Save Result</>}
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

export default ResultManagement;