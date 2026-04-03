import api from './api';

// Student Service
export const studentService = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    filterByProgram: (programId) => api.get(`/students/filter/${programId}`),
    search: (query) => api.get(`/students/search?q=${query}`),
    getPaginated: (page, limit) => api.get(`/students/paginated?page=${page}&limit=${limit}`),
};

// Course Service
export const courseService = {
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    getByDepartment: (deptId) => api.get(`/courses/department/${deptId}`),
    addPrerequisite: (courseNo, prereqCourseNo) => api.post(`/courses/${courseNo}/prerequisite`, { prereq_course_no: prereqCourseNo }),
};

// Instructor Service
export const instructorService = {
    getAll: () => api.get('/instructors'),
    getById: (id) => api.get(`/instructors/${id}`),
    create: (data) => api.post('/instructors', data),
    update: (id, data) => api.put(`/instructors/${id}`, data),
    delete: (id) => api.delete(`/instructors/${id}`),
    getByDepartment: (deptId) => api.get(`/instructors/department/${deptId}`),
    search: (query) => api.get(`/instructors/search?q=${query}`),
};

// Department Service
export const departmentService = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
};