import React, { useState, useEffect } from 'react';
import { 
    Users, 
    BookOpen, 
    User as UserIcon, 
    Building2,
    TrendingUp,
    TrendingDown,
    Activity,
    GraduationCap,
    Award,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import { dashboardService } from '../services/reportService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [enrollmentTrends, setEnrollmentTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes, trendsRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getRecentActivity(),
                dashboardService.getEnrollmentTrends()
            ]);
            
            setStats(statsRes.data.data);
            setRecentActivity(activityRes.data.data || []);
            setEnrollmentTrends(trendsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const statCards = [
        { title: 'Total Students', value: stats?.counts?.students || 0, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%', trend: 'up' },
        { title: 'Total Courses', value: stats?.counts?.courses || 0, icon: BookOpen, color: 'from-green-500 to-green-600', change: '+5%', trend: 'up' },
        { title: 'Instructors', value: stats?.counts?.instructors || 0, icon: UserIcon, color: 'from-purple-500 to-purple-600', change: '+8%', trend: 'up' },
        { title: 'Departments', value: stats?.counts?.departments || 0, icon: Building2, color: 'from-orange-500 to-orange-600', change: '0%', trend: 'neutral' },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening in your university.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="card p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.trend === 'up' ? (
                                        <TrendingUp size={14} className="text-green-500 mr-1" />
                                    ) : stat.trend === 'down' ? (
                                        <TrendingDown size={14} className="text-red-500 mr-1" />
                                    ) : null}
                                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">vs last month</span>
                                </div>
                            </div>
                            <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-lg`}>
                                <stat.icon className="text-white" size={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students per Program - Bar Chart */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Students per Program</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.studentsPerProgram || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="program_name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Grade Distribution - Pie Chart */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.gradeDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ grade, percent }) => `${grade}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                dataKey="count"
                                nameKey="grade"
                            >
                                {(stats?.gradeDistribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Enrollment Trends */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Enrollment Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={enrollmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="enrollment_count" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="student_count" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Students & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Students */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">🏆 Top Performing Students</h2>
                    <div className="space-y-3">
                        {stats?.topStudents?.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}>
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{student.first_name} {student.last_name}</p>
                                        <p className="text-xs text-gray-500">Student ID: {student.student_id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">{student.average_percentage}%</p>
                                    <p className="text-xs text-gray-500">Average</p>
                                </div>
                            </div>
                        ))}
                        {(!stats?.topStudents || stats.topStudents.length === 0) && (
                            <p className="text-center text-gray-400 py-4">No student data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">🔄 Recent Activity</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentActivity.slice(0, 10).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Activity size={16} className="text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {activity.student_name || 'User'} - {activity.course_title || 'Activity'}
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize">{activity.activity_type || 'update'}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-center text-gray-400 py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;