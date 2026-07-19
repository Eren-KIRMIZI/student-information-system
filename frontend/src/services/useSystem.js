import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSectionWeeklySchedule, getMyWeeklySchedule, createWeeklySlot, updateWeeklySlot, deleteWeeklySlot,
  getSectionExamSchedule, getMyExamSchedule, createExamSlot, updateExamSlot, deleteExamSlot,
  getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  getAdviseesByLecturer, getAdvisorAssignments, createAdvisorAssignment, deactivateAdvisorAssignment,
  getMe, updateMe, uploadPhoto, getUsers, createUser, updateUser, updateUserStatus,
  getRoles, updateRole, getLogs,
  uploadFile, getSectionMaterials, deleteUpload,
} from '../api/system.api';

// ====== Weekly Schedule ======
export const useSectionWeeklySchedule = (sectionId) =>
  useQuery({
    queryKey: ['weekly-schedule', sectionId],
    queryFn: () => getSectionWeeklySchedule(sectionId),
    enabled: !!sectionId,
  });

export const useMyWeeklySchedule = () =>
  useQuery({ queryKey: ['weekly-schedule', 'me'], queryFn: getMyWeeklySchedule });

export const useCreateWeeklySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => createWeeklySlot(sectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly-schedule'] }),
  });
};

export const useUpdateWeeklySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateWeeklySlot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly-schedule'] }),
  });
};

export const useDeleteWeeklySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWeeklySlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly-schedule'] }),
  });
};

// ====== Exam Schedule ======
export const useSectionExamSchedule = (sectionId, params) =>
  useQuery({
    queryKey: ['exam-schedule', sectionId, params],
    queryFn: () => getSectionExamSchedule(sectionId, params),
    enabled: !!sectionId,
  });

export const useMyExamSchedule = (params) =>
  useQuery({ queryKey: ['exam-schedule', 'me', params], queryFn: () => getMyExamSchedule(params) });

export const useCreateExamSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => createExamSlot(sectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-schedule'] }),
  });
};

export const useUpdateExamSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateExamSlot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-schedule'] }),
  });
};

export const useDeleteExamSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExamSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-schedule'] }),
  });
};

// ====== Announcements ======
export const useAnnouncements = (params) =>
  useQuery({ queryKey: ['announcements', params], queryFn: () => getAnnouncements(params) });

export const useAnnouncement = (id) =>
  useQuery({ queryKey: ['announcement', id], queryFn: () => getAnnouncement(id), enabled: !!id });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

// ====== Academic Calendar ======
export const useCalendarEvents = (params) =>
  useQuery({ queryKey: ['calendar', params], queryFn: () => getCalendarEvents(params) });

export const useCreateCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });
};

export const useUpdateCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCalendarEvent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });
};

export const useDeleteCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });
};

// ====== Advisor Assignments ======
export const useAdvisorAssignments = (params) =>
  useQuery({ queryKey: ['advisor-assignments', params], queryFn: () => getAdvisorAssignments(params) });

export const useAdvisees = (lecturerId) =>
  useQuery({
    queryKey: ['advisees', lecturerId],
    queryFn: () => getAdviseesByLecturer(lecturerId),
    enabled: !!lecturerId,
  });

export const useCreateAdvisorAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdvisorAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['advisor-assignments'] }),
  });
};

export const useDeactivateAdvisorAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateAdvisorAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['advisor-assignments'] }),
  });
};

// ====== Users / Profile ======
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: getMe });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useUploadPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => getUsers(params) });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// ====== Roles ======
export const useRoles = () =>
  useQuery({ queryKey: ['roles'], queryFn: getRoles });

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
};

// ====== Logs ======
export const useLogs = (params) =>
  useQuery({ queryKey: ['logs', params], queryFn: () => getLogs(params) });

// ====== Uploads / Materials ======
export const useSectionMaterials = (sectionId) =>
  useQuery({
    queryKey: ['section-materials', sectionId],
    queryFn: () => getSectionMaterials(sectionId),
    enabled: !!sectionId,
  });

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['section-materials'] }),
  });
};

export const useDeleteUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['section-materials'] }),
  });
};
