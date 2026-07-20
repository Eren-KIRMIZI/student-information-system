import * as repo from '../repositories/attendance.repository.js';
import { AppError } from '../utils/appError.util.js';
import { getIO } from '../config/socket.js';
import prisma from '../config/prisma.js';

export const getMyAttendance = async (userId) => {
  const student = await repo.studentFindByUserId(userId);
  if (!student) throw new AppError('Profil bulunamadı', 404);
  return repo.attendanceFindByStudent(student.id);
};

export const getSectionAttendance = async (courseSectionId, date) => {
  return repo.attendanceFindBySection(courseSectionId, date);
};

export const recordAttendance = async (courseSectionId, data, reqUser) => {
  const { date, records } = data;
  if (!date || !Array.isArray(records) || !records.length) {
    throw new AppError('Tarih ve en az bir kayıt gerekli');
  }
  let recordedById = null;
  if (reqUser.role === 'ACADEMICIAN') {
    const lecturer = await repo.lecturerFindByUserId(reqUser.id);
    recordedById = lecturer?.id;

    const section = await prisma.courseSection.findUnique({
      where: { id: courseSectionId },
      select: { lecturerId: true },
    });
    if (section && section.lecturerId !== recordedById) {
      throw new AppError('Bu ders şubesine yoklama girme yetkiniz yok', 403);
    }
  }
  const payload = records.map(r => ({ enrollmentId: r.enrollmentId, date, status: r.status }));
  const result = await repo.attendanceBulkUpsert(payload, recordedById);
  try { getIO().to(`courseSection:${courseSectionId}`).emit('attendance:updated', { courseSectionId, date }); } catch {}
  return result;
};
