import api from './api';

export const courseService = {
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    getByDepartment: (deptId) => api.get(`/courses/department/${deptId}`),
    addPrerequisite: (courseNo, prereqCourseNo) => api.post(`/courses/${courseNo}/prerequisite`, { prereq_course_no: prereqCourseNo }),
};