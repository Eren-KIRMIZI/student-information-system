import axiosInstance from './axiosInstance';

// ====== Faculties ======
export const getFaculties   = (params) => axiosInstance.get('/faculties', { params }).then(r => r.data);
export const getFaculty     = (id)     => axiosInstance.get(`/faculties/${id}`).then(r => r.data.data);
export const createFaculty  = (data)   => axiosInstance.post('/faculties', data).then(r => r.data);
export const updateFaculty  = (id, d)  => axiosInstance.put(`/faculties/${id}`, d).then(r => r.data);
export const deleteFaculty  = (id)     => axiosInstance.delete(`/faculties/${id}`).then(r => r.data);

// ====== Departments ======
export const getDepartments  = (params) => axiosInstance.get('/departments', { params }).then(r => r.data);
export const getDepartment   = (id)     => axiosInstance.get(`/departments/${id}`).then(r => r.data.data);
export const createDepartment= (data)   => axiosInstance.post('/departments', data).then(r => r.data);
export const updateDepartment= (id, d)  => axiosInstance.put(`/departments/${id}`, d).then(r => r.data);
export const deleteDepartment= (id)     => axiosInstance.delete(`/departments/${id}`).then(r => r.data);

// ====== Courses ======
export const getCourses  = (params) => axiosInstance.get('/courses', { params }).then(r => r.data);
export const getCourse   = (id)     => axiosInstance.get(`/courses/${id}`).then(r => r.data.data);
export const createCourse= (data)   => axiosInstance.post('/courses', data).then(r => r.data);
export const updateCourse= (id, d)  => axiosInstance.put(`/courses/${id}`, d).then(r => r.data);
export const deleteCourse= (id)     => axiosInstance.delete(`/courses/${id}`).then(r => r.data);

// ====== Course Sections ======
export const getCourseSections  = (params) => axiosInstance.get('/course-sections', { params }).then(r => r.data);
export const getCourseSection   = (id)     => axiosInstance.get(`/course-sections/${id}`).then(r => r.data.data);
export const createCourseSection= (data)   => axiosInstance.post('/course-sections', data).then(r => r.data);
export const updateCourseSection= (id, d)  => axiosInstance.put(`/course-sections/${id}`, d).then(r => r.data);
export const archiveCourseSection=(id)     => axiosInstance.put(`/course-sections/${id}/archive`).then(r => r.data);
export const deleteCourseSection = (id)    => axiosInstance.delete(`/course-sections/${id}`).then(r => r.data);

// ====== Lecturer Sections ======
export const getSectionsByLecturer = (lecturerId) =>
  axiosInstance.get('/course-sections', { params: { lecturerId, status: 'ACTIVE' } }).then(r => r.data?.data || r.data);
