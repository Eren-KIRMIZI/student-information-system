import axiosInstance from './axiosInstance';

// ====== Students ======
export const getStudents   = (params) => axiosInstance.get('/students', { params }).then(r => r.data);
export const getStudent    = (id)     => axiosInstance.get(`/students/${id}`).then(r => r.data.data);
export const createStudent = (data)   => axiosInstance.post('/students', data).then(r => r.data);
export const updateStudent = (id, d)  => axiosInstance.put(`/students/${id}`, d).then(r => r.data);
export const updateStudentStatus = (id, isActive) => axiosInstance.put(`/students/${id}/status`, { isActive }).then(r => r.data);

// ====== Lecturers ======
export const getLecturers   = (params) => axiosInstance.get('/lecturers', { params }).then(r => r.data);
export const getLecturer    = (id)     => axiosInstance.get(`/lecturers/${id}`).then(r => r.data.data);
export const createLecturer = (data)   => axiosInstance.post('/lecturers', data).then(r => r.data);
export const updateLecturer = (id, d)  => axiosInstance.put(`/lecturers/${id}`, d).then(r => r.data);
export const updateLecturerStatus = (id, isActive) => axiosInstance.put(`/lecturers/${id}/status`, { isActive }).then(r => r.data);
