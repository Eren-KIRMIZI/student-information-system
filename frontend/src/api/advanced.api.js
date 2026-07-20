import axiosInstance from './axiosInstance';

export const checkPrerequisites = (courseId) => axiosInstance.get(`/prerequisites/check/${courseId}`).then(r => r.data.data);
export const getPrerequisitesForCourse = (courseId) => axiosInstance.get(`/prerequisites/course/${courseId}`).then(r => r.data.data);
export const createPrerequisite = (data) => axiosInstance.post('/prerequisites', data).then(r => r.data);
export const deletePrerequisite = (id) => axiosInstance.delete(`/prerequisites/${id}`).then(r => r.data);

export const joinWaitlist = (data) => axiosInstance.post('/waitlist', data).then(r => r.data);
export const cancelWaitlist = (courseSectionId) => axiosInstance.delete(`/waitlist/${courseSectionId}`).then(r => r.data);
export const getMyWaitlist = () => axiosInstance.get('/waitlist/me').then(r => r.data.data);
export const getWaitlistForSection = (courseSectionId) => axiosInstance.get(`/waitlist/section/${courseSectionId}`).then(r => r.data.data);
export const promoteFromWaitlist = (id) => axiosInstance.post(`/waitlist/${id}/promote`).then(r => r.data);

export const getMyTranscriptAdvanced = () => axiosInstance.get('/academic/transcript').then(r => r.data.data);
export const getTranscriptForStudent = (studentId) => axiosInstance.get(`/academic/transcript/student/${studentId}`).then(r => r.data.data);
export const getMyGraduationStatus = () => axiosInstance.get('/academic/graduation/my').then(r => r.data.data);
export const checkStudentGraduation = (studentId) => axiosInstance.get(`/academic/graduation/student/${studentId}`).then(r => r.data.data);
export const setGraduationRequirement = (departmentId, data) => axiosInstance.put(`/academic/graduation/requirement/${departmentId}`, data).then(r => r.data);

export const generateQRToken = (data) => axiosInstance.post('/qr-attendance/generate', data).then(r => r.data.data);
export const getActiveQRToken = (courseSectionId) => axiosInstance.get(`/qr-attendance/active/${courseSectionId}`).then(r => r.data.data);
export const scanQRToken = (data) => axiosInstance.post('/qr-attendance/scan', data).then(r => r.data);
export const deactivateQRToken = (id) => axiosInstance.put(`/qr-attendance/${id}/deactivate`).then(r => r.data);
export const getSectionQRScans = (courseSectionId) => axiosInstance.get(`/qr-attendance/section/${courseSectionId}`).then(r => r.data.data);
export const getRecentQRScans = (courseSectionId) => axiosInstance.get(`/qr-attendance/recent/${courseSectionId}`).then(r => r.data.data);

export const getMyAnalytics = () => axiosInstance.get('/student-analytics/me').then(r => r.data.data);
export const getAdvisorStudents = () => axiosInstance.get('/advisor-analytics/students').then(r => r.data.data);
export const getAdvisorStudentDetail = (studentId) => axiosInstance.get(`/advisor-analytics/students/${studentId}`).then(r => r.data.data);

export const getScheduleConflicts = () => axiosInstance.get('/schedule-optimizer/my-schedule').then(r => r.data.data);
export const getAvailableSections = (courseId) => axiosInstance.get(`/schedule-optimizer/available-sections/${courseId}`).then(r => r.data.data);

export const getAdminKPIs = () => axiosInstance.get('/admin-dashboard/kpis').then(r => r.data.data);
