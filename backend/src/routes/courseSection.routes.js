import { Router } from 'express';
import * as svc from '../services/academic.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
// Weekly + Exam schedule sub-routes are handled in their own route files
// but section-scoped endpoints are registered here
import prisma from '../config/prisma.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.listCourseSections(req.query)); } catch (e) { next(e); }
});
router.get('/:id', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.getCourseSectionById(req.params.id)); } catch (e) { next(e); }
});
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.createCourseSection(req.body), 'Ders şubesi oluşturuldu', 201); } catch (e) { next(e); }
});
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.updateCourseSection(req.params.id, req.body), 'Ders şubesi güncellendi'); } catch (e) { next(e); }
});
router.put('/:id/archive', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.archiveCourseSection(req.params.id), 'Şube arşivlendi'); } catch (e) { next(e); }
});
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { await svc.deleteCourseSection(req.params.id); return successResponse(res, null, 'Ders şubesi silindi'); } catch (e) { next(e); }
});

// Grades sub-route
router.get('/:id/grades', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseSectionId: req.params.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { student: true, grade: true },
      orderBy: { student: { lastName: 'asc' } },
    });
    return successResponse(res, enrollments);
  } catch (e) { next(e); }
});

// Attendance sub-route
router.get('/:id/attendance', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const { date } = req.query;
    const where = { enrollment: { courseSectionId: req.params.id } };
    if (date) where.date = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) };
    const records = await prisma.attendance.findMany({ where, include: { enrollment: { include: { student: true } } } });
    return successResponse(res, records);
  } catch (e) { next(e); }
});

router.post('/:id/attendance', authenticate, authorize('ACADEMICIAN'), async (req, res, next) => {
  try {
    const { records } = req.body; // [{ enrollmentId, status }]
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const lecturer = await prisma.lecturer.findUnique({ where: { userId: req.user.id } });
    const created = await Promise.all(records.map(r =>
      prisma.attendance.upsert({
        where: { enrollmentId_date: { enrollmentId: r.enrollmentId, date } },
        update: { status: r.status, recordedById: lecturer?.id },
        create: { enrollmentId: r.enrollmentId, date, status: r.status, recordedById: lecturer?.id },
      })
    ));
    return successResponse(res, created, 'Yoklama kaydedildi');
  } catch (e) { next(e); }
});

// Weekly schedule sub-route
router.get('/:id/weekly-schedule', authenticate, async (req, res, next) => {
  try {
    const slots = await prisma.weeklySchedule.findMany({ where: { courseSectionId: req.params.id }, orderBy: { dayOfWeek: 'asc' } });
    return successResponse(res, slots);
  } catch (e) { next(e); }
});

router.post('/:id/weekly-schedule', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const slot = await prisma.weeklySchedule.create({ data: { ...req.body, courseSectionId: req.params.id } });
    return successResponse(res, slot, 'Program slotu eklendi', 201);
  } catch (e) { next(e); }
});

// Exam schedule sub-route
router.get('/:id/exam-schedule', authenticate, async (req, res, next) => {
  try {
    const { examType } = req.query;
    const where = { courseSectionId: req.params.id };
    if (examType) where.examType = examType;
    const exams = await prisma.examSchedule.findMany({ where, include: { supervisor: true }, orderBy: { examDate: 'asc' } });
    return successResponse(res, exams);
  } catch (e) { next(e); }
});

router.post('/:id/exam-schedule', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const exam = await prisma.examSchedule.create({ data: { ...req.body, courseSectionId: req.params.id, examDate: new Date(req.body.examDate) } });
    return successResponse(res, exam, 'Sınav slotu eklendi', 201);
  } catch (e) { next(e); }
});

// Materials sub-route
router.get('/:id/materials', authenticate, async (req, res, next) => {
  try {
    const materials = await prisma.upload.findMany({ where: { courseSectionId: req.params.id, purpose: 'COURSE_MATERIAL' }, include: { uploader: { select: { email: true } } }, orderBy: { createdAt: 'desc' } });
    return successResponse(res, materials);
  } catch (e) { next(e); }
});

export default router;
