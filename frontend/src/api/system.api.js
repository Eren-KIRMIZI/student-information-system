import axiosInstance from './axiosInstance';

// ====== Weekly Schedule ======
export const getSectionWeeklySchedule = (id)     => axiosInstance.get(`/course-sections/${id}/weekly-schedule`).then(r => r.data.data);
export const getMyWeeklySchedule      = ()        => axiosInstance.get('/weekly-schedule/me').then(r => r.data.data);
export const createWeeklySlot         = (id, d)   => axiosInstance.post(`/course-sections/${id}/weekly-schedule`, d).then(r => r.data);
export const updateWeeklySlot         = (id, d)   => axiosInstance.put(`/weekly-schedule/${id}`, d).then(r => r.data);
export const deleteWeeklySlot         = (id)      => axiosInstance.delete(`/weekly-schedule/${id}`).then(r => r.data);

// ====== Exam Schedule ======
export const getSectionExamSchedule = (id, params) => axiosInstance.get(`/course-sections/${id}/exam-schedule`, { params }).then(r => r.data.data);
export const getMyExamSchedule      = (params)     => axiosInstance.get('/exam-schedule/me', { params }).then(r => r.data.data);
export const createExamSlot         = (id, d)      => axiosInstance.post(`/course-sections/${id}/exam-schedule`, d).then(r => r.data);
export const updateExamSlot         = (id, d)      => axiosInstance.put(`/exam-schedule/${id}`, d).then(r => r.data);
export const deleteExamSlot         = (id)         => axiosInstance.delete(`/exam-schedule/${id}`).then(r => r.data);

// ====== Announcements ======
export const getAnnouncements  = (params) => axiosInstance.get('/announcements', { params }).then(r => r.data);
export const getAnnouncement   = (id)     => axiosInstance.get(`/announcements/${id}`).then(r => r.data.data);
export const createAnnouncement= (data)   => axiosInstance.post('/announcements', data).then(r => r.data);
export const updateAnnouncement= (id, d)  => axiosInstance.put(`/announcements/${id}`, d).then(r => r.data);
export const deleteAnnouncement= (id)     => axiosInstance.delete(`/announcements/${id}`).then(r => r.data);

// ====== Academic Calendar ======
export const getCalendarEvents  = (params) => axiosInstance.get('/academic-calendar', { params }).then(r => r.data);
export const createCalendarEvent= (data)   => axiosInstance.post('/academic-calendar', data).then(r => r.data);
export const updateCalendarEvent= (id, d)  => axiosInstance.put(`/academic-calendar/${id}`, d).then(r => r.data);
export const deleteCalendarEvent= (id)     => axiosInstance.delete(`/academic-calendar/${id}`).then(r => r.data);

// ====== Advisor Assignments ======
export const getAdvisorAssignments     = (params) => axiosInstance.get('/advisor-assignments', { params }).then(r => r.data);
export const getAdviseesByLecturer     = (id)     => axiosInstance.get(`/advisor-assignments/lecturer/${id}/students`).then(r => r.data.data);
export const createAdvisorAssignment   = (data)   => axiosInstance.post('/advisor-assignments', data).then(r => r.data);
export const deactivateAdvisorAssignment=(id)     => axiosInstance.put(`/advisor-assignments/${id}/deactivate`).then(r => r.data);

// ====== Users / Roles ======
export const getMe     = ()      => axiosInstance.get('/users/me').then(r => r.data.data);
export const updateMe  = (data)  => axiosInstance.put('/users/me', data).then(r => r.data);
export const uploadPhoto= (form) => axiosInstance.put('/users/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const getUsers  = (params)=> axiosInstance.get('/users', { params }).then(r => r.data);
export const createUser= (data)  => axiosInstance.post('/users', data).then(r => r.data);
export const updateUser= (id,d)  => axiosInstance.put(`/users/${id}`, d).then(r => r.data);
export const updateUserStatus=(id,isActive)=> axiosInstance.put(`/users/${id}/status`, { isActive }).then(r => r.data);
export const getRoles  = ()      => axiosInstance.get('/roles').then(r => r.data.data);
export const updateRole= (id,d)  => axiosInstance.put(`/roles/${id}`, d).then(r => r.data);

// ====== Logs ======
export const getLogs       = (params)=> axiosInstance.get('/logs', { params }).then(r => r.data);
export const getAuditLogs  = (params)=> axiosInstance.get('/logs/audit', { params }).then(r => r.data);

// ====== Uploads ======
export const uploadFile     = (form)    => axiosInstance.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const getSectionMaterials=(id)   => axiosInstance.get(`/course-sections/${id}/materials`).then(r => r.data.data);
export const deleteUpload   = (id)      => axiosInstance.delete(`/uploads/${id}`).then(r => r.data);
