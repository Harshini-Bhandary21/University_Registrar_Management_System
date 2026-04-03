import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronDown, RefreshCw, Download, X } from 'lucide-react';
import { studentService, courseService, instructorService, departmentService } from '../services/studentService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as XLSX from 'xlsx';  // Changed from 'xlsx-js-style' to 'xlsx'

const ViewSearch = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchData();
        fetchFilterOptions();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            switch(activeTab) {
                case 'students':
                    response = await studentService.getAll();
                    break;
                case 'courses':
                    response = await courseService.getAll();
                    break;
                case 'instructors':
                    response = await instructorService.getAll();
                    break;
                default:
                    response = { data: { data: [] } };
            }
            setData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const deptRes = await departmentService.getAll();
            setFilters({ departments: deptRes.data.data || [] });
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const getFilterOptions = () => {
        if (activeTab === 'students') {
            return [
                { value: 'all', label: 'All Programs' },
                { value: '1', label: 'BTech CSE' },
                { value: '2', label: 'BTech ECE' },
                { value: '3', label: 'BTech ME' },
                { value: '4', label: 'MTech CSE' },
            ];
        } else if (activeTab === 'courses') {
            return [
                { value: 'all', label: 'All Departments' },
                ...(filters.departments || []).map(d => ({ value: String(d.dept_id), label: d.dept_name }))
            ];
        } else if (activeTab === 'instructors') {
            return [
                { value: 'all', label: 'All Departments' },
                ...(filters.departments || []).map(d => ({ value: String(d.dept_id), label: d.dept_name }))
            ];
        }
        return [{ value: 'all', label: 'All' }];
    };

    const filteredData = data.filter(item => {
        let matchesSearch = true;
        let matchesFilter = true;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            if (activeTab === 'students') {
                matchesSearch = 
                    item.first_name?.toLowerCase().includes(searchLower) ||
                    item.last_name?.toLowerCase().includes(searchLower) ||
                    String(item.student_id).includes(searchTerm);
            } else if (activeTab === 'courses') {
                matchesSearch = 
                    item.course_no?.toLowerCase().includes(searchLower) ||
                    item.title?.toLowerCase().includes(searchLower);
            } else if (activeTab === 'instructors') {
                matchesSearch = 
                    item.first_name?.toLowerCase().includes(searchLower) ||
                    item.last_name?.toLowerCase().includes(searchLower) ||
                    String(item.instructor_id).includes(searchTerm);
            }
        }

        if (selectedFilter !== 'all') {
            if (activeTab === 'students') {
                matchesFilter = String(item.program_id) === selectedFilter;
            } else if (activeTab === 'courses') {
                matchesFilter = String(item.dept_id) === selectedFilter;
            } else if (activeTab === 'instructors') {
                matchesFilter = String(item.dept_id) === selectedFilter;
            }
        }

        return matchesSearch && matchesFilter;
    });

    const exportToExcel = () => {
        const exportData = filteredData.map(item => {
            if (activeTab === 'students') {
                return {
                    'Student ID': item.student_id,
                    'First Name': item.first_name,
                    'Middle Name': item.middle_name || '',
                    'Last Name': item.last_name,
                    'Age': item.age,
                    'Program': item.program_name
                };
            } else if (activeTab === 'courses') {
                return {
                    'Course No': item.course_no,
                    'Title': item.title,
                    'Credits': item.credits,
                    'Syllabus': item.syllabus || '',
                    'Department': item.dept_name
                };
            } else {
                return {
                    'Instructor ID': item.instructor_id,
                    'First Name': item.first_name,
                    'Last Name': item.last_name,
                    'Title': item.title,
                    'Department': item.dept_name
                };
            }
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab);
        XLSX.writeFile(wb, `${activeTab}_export.xlsx`);
    };

    const getColumns = () => {
        if (activeTab === 'students') {
            return ['ID', 'Name', 'Program', 'Age', 'Actions'];
        } else if (activeTab === 'courses') {
            return ['Course No', 'Title', 'Credits', 'Department', 'Actions'];
        }
        return ['ID', 'Name', 'Title', 'Department', 'Actions'];
    };

    const renderRow = (item) => {
        if (activeTab === 'students') {
            return (
                <>
                    <td className="table-cell font-medium">{item.student_id}</td>
                    <td className="table-cell">{`${item.first_name} ${item.last_name || ''}`}</td>
                    <td className="table-cell">
                        <span className="badge badge-info">{item.program_name}</span>
                    </td>
                    <td className="table-cell">{item.age}</td>
                    <td className="table-cell">
                        <button
                            onClick={() => setSelectedRecord(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                            <Eye size={16} />
                            View
                        </button>
                    </td>
                </>
            );
        } else if (activeTab === 'courses') {
            return (
                <>
                    <td className="table-cell font-medium">{item.course_no}</td>
                    <td className="table-cell">{item.title}</td>
                    <td className="table-cell">
                        <span className="badge badge-purple">{item.credits} credits</span>
                    </td>
                    <td className="table-cell">{item.dept_name}</td>
                    <td className="table-cell">
                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            <Eye size={16} />
                            View
                        </button>
                    </td>
                </>
            );
        }
        return (
            <>
                <td className="table-cell font-medium">{item.instructor_id}</td>
                <td className="table-cell">{`${item.first_name} ${item.last_name || ''}`}</td>
                <td className="table-cell">{item.title}</td>
                <td className="table-cell">{item.dept_name}</td>
                <td className="table-cell">
                    <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        <Eye size={16} />
                        View
                    </button>
                </td>
            </>
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        View & Search Records
                    </h1>
                    <p className="text-gray-500 mt-1">Browse, search, filter, and export university records</p>
                </div>

                <div className="flex space-x-1 border-b mb-6">
                    {['students', 'courses', 'instructors'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium transition-all duration-200 capitalize ${
                                activeTab === tab
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                            onClick={fetchData}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <RefreshCw size={18} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="btn-success flex items-center space-x-2"
                        >
                            <Download size={18} />
                            <span>Export</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t animate-slide-down">
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Filter by:</label>
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="input-field w-auto min-w-[200px]"
                                >
                                    {getFilterOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Found <span className="font-semibold text-gray-700">{filteredData.length}</span> record{filteredData.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="card overflow-hidden">
                    <div className="table-container">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    {getColumns().map((col, index) => (
                                        <th key={index} className="table-header">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="table-row">
                                        {renderRow(item)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredData.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No records found matching your criteria</p>
                        </div>
                    )}
                </div>

                {selectedRecord && (
                    <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Student ID</label>
                                            <p className="font-semibold text-gray-800">{selectedRecord.student_id}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Full Name</label>
                                            <p className="font-semibold text-gray-800">{selectedRecord.first_name} {selectedRecord.last_name}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Program</label>
                                            <p className="font-semibold text-gray-800">{selectedRecord.program_name}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Age</label>
                                            <p className="font-semibold text-gray-800">{selectedRecord.age} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</label>
                                            <p className="font-semibold text-gray-800">{selectedRecord.dob}</p>
                                        </div>
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

export default ViewSearch;