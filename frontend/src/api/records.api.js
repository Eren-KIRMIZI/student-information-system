import axiosInstance from './axiosInstance';

// ====== Enrollments ======
export const getMyEnrollments = (params) => axiosInstance.get('/enrollments/me', { params }).then((r) => r.data.data);
export const getEnrollments = (params) => axiosInstance.get('/enrollments', { params }).then((r) => r.data);
export const createEnrollment = (data) => axiosInstance.post('/enrollments', data).then((r) => r.data);
export const approveEnrollment = (id) => axiosInstance.put(`/enrollments/${id}/approve`).then((r) => r.data);
export const rejectEnrollment = (id) => axiosInstance.put(`/enrollments/${id}/reject`).then((r) => r.data);
export const dropEnrollment = (id) => axiosInstance.put(`/enrollments/${id}/drop`).then((r) => r.data);

// ====== Grades ======
export const getMyGrades = (params) => axiosInstance.get('/grades/me', { params }).then((r) => r.data.data);
export const getMyTranscript = () => axiosInstance.get('/grades/transcript/me').then((r) => r.data.data);
export const getMyTranscriptPDF = () =>
  axiosInstance.get('/grades/transcript/me/pdf', { responseType: 'blob' }).then((r) => r.data);
export const getSectionGrades = (id) => axiosInstance.get(`/course-sections/${id}/grades`).then((r) => r.data);
export const updateGrade = (enrollmentId, data) =>
  axiosInstance.put(`/grades/${enrollmentId}`, data).then((r) => r.data);
export const finalizeGrade = (enrollmentId) =>
  axiosInstance.put(`/grades/${enrollmentId}/finalize`).then((r) => r.data);

// ====== Attendance ======
export const getSectionAttendance = (id, params) =>
  axiosInstance.get(`/course-sections/${id}/attendance`, { params }).then((r) => r.data);
export const createAttendance = (id, data) =>
  axiosInstance.post(`/course-sections/${id}/attendance`, data).then((r) => r.data);
export const getMyAttendance = () => axiosInstance.get('/attendance/me').then((r) => r.data.data);
