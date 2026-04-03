import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Database, CheckCircle, Trash2, Edit } from 'lucide-react';
import { studentService, courseService, instructorService, departmentService } from '../services/studentService';
import toast from 'react-hot-toast';

const DataEntry = () => {
    const [selectedTable, setSelectedTable] = useState('student');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [records, setRecords] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchDropdownData();
        fetchRecords();
    }, [selectedTable]);

    const fetchDropdownData = async () => {
        try {
            const deptRes = await departmentService.getAll();
            setDepartments(deptRes.data.data || []);
            setPrograms([
                { program_id: 1, program_name: 'BTech CSE' },
                { program_id: 2, program_name: 'BTech ECE' },
                { program_id: 3, program_name: 'BTech ME' },
                { program_id: 4, program_name: 'MTech CSE' },
            ]);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const fetchRecords = async () => {
        try {
            let response;
            switch(selectedTable) {
                case 'student':
                    response = await studentService.getAll();
                    break;
                case 'course':
                    response = await courseService.getAll();
                    break;
                case 'instructor':
                    response = await instructorService.getAll();
                    break;
                default:
                    response = { data: { data: [] } };
            }
            setRecords(response.data.data || []);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    const tables = [
        { id: 'student', name: 'Student', icon: '👨‍🎓', fields: [
            { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
            { name: 'middle_name', label: 'Middle Name', type: 'text', required: false, placeholder: 'Enter middle name' },
            { name: 'last_name', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
            { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
            { name: 'age', label: 'Age', type: 'number', required: true, placeholder: 'Enter age' },
            { name: 'program_id', label: 'Program', type: 'select', required: true, options: programs.map(p => ({ value: p.program_id, label: p.program_name })) },
        ] },
        { id: 'course', name: 'Course', icon: '📚', fields: [
            { name: 'course_no', label: 'Course Number', type: 'text', required: true, placeholder: 'e.g., CS101' },
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter course title' },
            { name: 'credits', label: 'Credits', type: 'number', required: true, placeholder: 'Enter credits' },
            { name: 'syllabus', label: 'Syllabus', type: 'text', required: false, placeholder: 'Brief description' },
            { name: 'dept_id', label: 'Department', type: 'select', required: true, options: departments.map(d => ({ value: d.dept_id, label: d.dept_name })) },
        ] },
        { id: 'instructor', name: 'Instructor', icon: '👨‍🏫', fields: [
            { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
            { name: 'middle_name', label: 'Middle Name', type: 'text', required: false, placeholder: 'Enter middle name' },
            { name: 'last_name', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
            { name: 'title', label: 'Title', type: 'select', required: true, options: [
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Lecturer', label: 'Lecturer' },
            ] },
            { name: 'dept_id', label: 'Department', type: 'select', required: true, options: departments.map(d => ({ value: d.dept_id, label: d.dept_name })) },
        ] },
    ];

    const handleTableChange = (tableId) => {
        setSelectedTable(tableId);
        setFormData({});
        setEditingId(null);
        setShowForm(true);
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        
        if (fieldName === 'dob' && selectedTable === 'student') {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age > 0) {
                setFormData(prev => ({ ...prev, age }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (editingId) {
                switch(selectedTable) {
                    case 'student':
                        await studentService.update(editingId, formData);
                        break;
                    case 'course':
                        await courseService.update(editingId, formData);
                        break;
                    case 'instructor':
                        await instructorService.update(editingId, formData);
                        break;
                }
                toast.success(`${selectedTable.toUpperCase()} updated successfully!`);
                setEditingId(null);
            } else {
                switch(selectedTable) {
                    case 'student':
                        await studentService.create(formData);
                        break;
                    case 'course':
                        await courseService.create(formData);
                        break;
                    case 'instructor':
                        await instructorService.create(formData);
                        break;
                }
                toast.success(`${selectedTable.toUpperCase()} added successfully!`);
            }
            setFormData({});
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || `Error saving ${selectedTable}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                switch(selectedTable) {
                    case 'student':
                        await studentService.delete(id);
                        break;
                    case 'course':
                        await courseService.delete(id);
                        break;
                    case 'instructor':
                        await instructorService.delete(id);
                        break;
                }
                toast.success(`${selectedTable.toUpperCase()} deleted successfully!`);
                fetchRecords();
            } catch (error) {
                toast.error(error.response?.data?.message || `Error deleting ${selectedTable}`);
            }
        }
    };

    const handleEdit = (record) => {
        setFormData(record);
        setEditingId(record.student_id || record.course_no || record.instructor_id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentTable = tables.find(t => t.id === selectedTable);
    const getRecordId = (record) => record.student_id || record.course_no || record.instructor_id;
    const getRecordLabel = (record) => {
        if (selectedTable === 'student') return `${record.first_name} ${record.last_name}`;
        if (selectedTable === 'course') return `${record.course_no} - ${record.title}`;
        return `${record.first_name} ${record.last_name}`;
    };

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Data Entry
                    </h1>
                    <p className="text-gray-500 mt-1">Add, edit, or manage university records</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {tables.map((table) => (
                        <button
                            key={table.id}
                            onClick={() => handleTableChange(table.id)}
                            className={`card p-5 text-center transition-all duration-300 ${
                                selectedTable === table.id 
                                    ? 'ring-2 ring-blue-500 shadow-xl transform scale-105 bg-blue-50' 
                                    : 'hover:shadow-xl hover:scale-105'
                            }`}
                        >
                            <div className="text-4xl mb-2">{table.icon}</div>
                            <h3 className={`font-semibold text-lg ${selectedTable === table.id ? 'text-blue-600' : 'text-gray-700'}`}>
                                Add {table.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Create new {table.name.toLowerCase()} record</p>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {showForm && (
                        <div className="card p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingId ? `Edit ${currentTable.name}` : `Add New ${currentTable.name}`}
                                </h2>
                                <div className="text-sm text-gray-400">
                                    {editingId ? 'Editing existing record' : 'Auto-generated ID will be assigned'}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {currentTable.fields.map((field) => (
                                        <div key={field.name} className="space-y-1">
                                            <label className="input-label">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            
                                            {field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                    className="input-field"
                                                    required={field.required}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options?.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                    className="input-field"
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({});
                                            setEditingId(null);
                                        }}
                                        className="btn-secondary"
                                    >
                                        <X size={18} />
                                        <span>Clear</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary"
                                    >
                                        {loading ? (
                                            <div className="spinner-sm"></div>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>{editingId ? 'Update' : 'Save'} Record</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="card p-6">
                        <h2 className="text-xl font-semibold mb-4">📋 Recent {currentTable?.name}s</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {records.slice(0, 10).map((record) => (
                                <div key={getRecordId(record)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-800">{getRecordLabel(record)}</p>
                                        <p className="text-xs text-gray-500">ID: {getRecordId(record)}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(getRecordId(record))}
                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {records.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No records found. Add your first {currentTable?.name?.toLowerCase()}!</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-semibold text-blue-800">Pro Tips for Data Entry</h4>
                            <p className="text-sm text-blue-600 mt-1">
                                • All fields marked with <span className="text-red-500">*</span> are required<br />
                                • Student and Instructor IDs are auto-generated by the system<br />
                                • Course numbers should follow the format like 'CS101', 'EC201', etc.<br />
                                • Age will be automatically calculated from Date of Birth for students
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataEntry;