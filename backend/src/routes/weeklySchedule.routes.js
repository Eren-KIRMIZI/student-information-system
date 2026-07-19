import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

// GET /weekly-schedule/me — student's or academician's own weekly schedule
router.get('/me', authenticate, authorize('STUDENT', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
      if (!student) return next(new AppError('Profil bulunamadı', 404));
      const slots = await prisma.weeklySchedule.findMany({
        where: { courseSection: { enrollments: { some: { studentId: student.id, status: { in: ['ACTIVE','APPROVED'] } } } } },
        include: { courseSection: { include: { course: true, lecturer: true } } },
        orderBy: { dayOfWeek: 'asc' },
      });
      return successResponse(res, slots);
    }

    if (req.user.role === 'ACADEMICIAN') {
      const lecturer = await prisma.lecturer.findUnique({where:{userId:req.user.id},select:{id:true}});
      if (!lecturer) return next(new AppError('Profil bulunamadı', 404));
      const slots = await prisma.weeklySchedule.findMany({
        where: { courseSection: { lecturerId: lecturer.id } },
        include: { courseSection: { include: { course: true, lecturer: true } } },
        orderBy: { dayOfWeek: 'asc' },
      });
      return successResponse(res, slots);
    }
  } catch (e) { next(e); }
});

// PUT/DELETE single slot
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const slot = await prisma.weeklySchedule.update({ where:{id:req.params.id}, data:req.body });
    return successResponse(res, slot, 'Slot güncellendi');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.weeklySchedule.delete({ where:{id:req.params.id} });
    return successResponse(res, null, 'Slot silindi');
  } catch (e) { next(e); }
});

export default router;
