import api from './api';

export const reportService = {
    getStudentReport: (studentId) => api.get(`/reports/student/${studentId}`),
    getDepartmentReport: (deptId) => api.get(`/reports/department/${deptId}`),
    globalSearch: (query, type = 'all') => api.get(`/reports/search?q=${query}&type=${type}`),
    getProgramStatistics: () => api.get('/reports/statistics/programs'),
    getGradeDistribution: () => api.get('/reports/statistics/grades'),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentActivity: () => api.get('/dashboard/activity'),
    getEnrollmentTrends: () => api.get('/dashboard/enrollment-trends'),
};