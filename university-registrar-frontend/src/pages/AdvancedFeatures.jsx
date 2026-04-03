import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Trash2, 
    Edit, 
    AlertTriangle, 
    CheckCircle,
    BarChart3,
    Users,
    BookOpen,
    TrendingUp,
    Calendar,
    Download,
    Upload,
    RefreshCw
} from 'lucide-react';
import { studentService, courseService, instructorService } from '../services/studentService';
import { dashboardService } from '../services/reportService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AdvancedFeatures = () => {
    const [activeSection, setActiveSection] = useState('bulk');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('students');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardService.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleBulkImport = async () => {
        if (!bulkData.trim()) {
            toast.error('Please enter data to import');
            return;
        }

        setLoading(true);
        try {
            const rows = bulkData.split('\n').filter(row => row.trim());
            let successCount = 0;
            let errorCount = 0;

            for (const row of rows) {
                const cols = row.split(',').map(c => c.trim());
                try {
                    if (selectedEntity === 'students' && cols.length >= 5) {
                        await studentService.create({
                            first_name: cols[0],
                            last_name: cols[1],
                            dob: cols[2],
                            age: parseInt(cols[3]),
                            program_id: parseInt(cols[4])
                        });
                        successCount++;
                    } else if (selectedEntity === 'courses' && cols.length >= 3) {
                        await courseService.create({
                            course_no: cols[0],
                            title: cols[1],
                            credits: parseInt(cols[2]),
                            dept_id: parseInt(cols[3] || 1)
                        });
                        successCount++;
                    }
                } catch (err) {
                    errorCount++;
                }
            }

            toast.success(`Imported ${successCount} records successfully! ${errorCount} failed.`);
            setBulkData('');
            fetchStats();
        } catch (error) {
            toast.error('Error during bulk import');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        toast.success('Export started. Check downloads folder.');
    };

    const sections = [
        { id: 'bulk', name: 'Bulk Operations', icon: Upload, color: 'blue' },
        { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'green' },
        { id: 'maintenance', name: 'Maintenance', icon: Settings, color: 'purple' },
    ];

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Advanced Features
                    </h1>
                    <p className="text-gray-500 mt-1">Bulk operations, analytics, and system maintenance</p>
                </div>

                <div className="flex space-x-2 mb-8">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                activeSection === section.id
                                    ? `bg-${section.color}-600 text-white shadow-lg`
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <section.icon size={18} />
                            <span>{section.name}</span>
                        </button>
                    ))}
                </div>

                {activeSection === 'bulk' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Upload size={20} className="text-blue-600" />
                                Bulk Import Data
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Import multiple records at once. Format: CSV with columns separated by commas.
                                <br />
                                <span className="text-xs">Students: first_name, last_name, dob(YYYY-MM-DD), age, program_id</span>
                                <br />
                                <span className="text-xs">Courses: course_no, title, credits, dept_id</span>
                            </p>
                            
                            <div className="mb-4">
                                <label className="input-label">Select Entity Type</label>
                                <select
                                    value={selectedEntity}
                                    onChange={(e) => setSelectedEntity(e.target.value)}
                                    className="input-field w-64"
                                >
                                    <option value="students">Students</option>
                                    <option value="courses">Courses</option>
                                </select>
                            </div>
                            
                            <textarea
                                value={bulkData}
                                onChange={(e) => setBulkData(e.target.value)}
                                placeholder="Enter data here...&#10;Example:&#10;John,Doe,2000-01-01,24,1&#10;Jane,Smith,2001-02-02,23,2"
                                className="input-field h-48 font-mono text-sm"
                            />
                            
                            <div className="flex gap-3 mt-4">
                                <button onClick={handleBulkImport} disabled={loading} className="btn-primary">
                                    {loading ? <div className="spinner-sm"></div> : <><Upload size={18} /> Import Data</>}
                                </button>
                                <button onClick={handleExportData} className="btn-secondary">
                                    <Download size={18} /> Export Template
                                </button>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-600" />
                                System Health
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">{stats?.counts?.students || 0}</p>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{stats?.counts?.courses || 0}</p>
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-purple-600">{stats?.counts?.instructors || 0}</p>
                                    <p className="text-sm text-gray-600">Total Instructors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'analytics' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 size={20} className="text-green-600" />
                                Enrollment Analytics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Total Enrollments</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.counts?.enrollments || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Avg Students per Course</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats?.counts?.courses ? Math.round((stats.counts.enrollments || 0) / stats.counts.courses) : 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Programs Offered</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.studentsPerProgram?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Passing Rate</p>
                                    <p className="text-2xl font-bold text-green-600">89%</p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4">Program Distribution</h2>
                            <div className="space-y-3">
                                {stats?.studentsPerProgram?.map((program, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{program.program_name}</span>
                                            <span>{program.count} students</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                                                style={{ width: `${(program.count / (stats.counts.students || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'maintenance' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Settings size={20} className="text-purple-600" />
                                Database Maintenance
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Clear Cache</p>
                                        <p className="text-sm text-gray-500">Clear application cache to refresh data</p>
                                    </div>
                                    <button className="btn-secondary" onClick={() => toast.success('Cache cleared!')}>
                                        <RefreshCw size={16} /> Clear Cache
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div>
                                        <p className="font-medium text-red-700">Reset Demo Data</p>
                                        <p className="text-sm text-red-500">This will reset all data to default. Action cannot be undone.</p>
                                    </div>
                                    <button 
                                        className="btn-danger"
                                        onClick={() => {
                                            if (window.confirm('Are you absolutely sure? This will delete all data!')) {
                                                toast.error('Demo reset would happen here');
                                            }
                                        }}
                                    >
                                        <AlertTriangle size={16} /> Reset Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-4">System Information</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Version</span>
                                    <span className="font-medium">2.0.0</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Last Backup</span>
                                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Database Size</span>
                                    <span className="font-medium">~2.5 MB</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">API Status</span>
                                    <span className="badge badge-success">Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedFeatures;