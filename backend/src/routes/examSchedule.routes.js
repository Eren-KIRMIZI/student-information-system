import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    let where = {};
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
      where = { courseSection: { enrollments: { some: { studentId: student.id, status: { in: ['ACTIVE','APPROVED'] } } } } };
    } else if (req.user.role === 'ACADEMICIAN') {
      const lecturer = await prisma.lecturer.findUnique({where:{userId:req.user.id},select:{id:true}});
      where = { courseSection: { lecturerId: lecturer.id } };
    }
    const { examType } = req.query;
    if (examType) where.examType = examType;
    const exams = await prisma.examSchedule.findMany({
      where, include: { courseSection: { include: { course: true, lecturer: true } } },
      orderBy: { examDate: 'asc' },
    });
    return successResponse(res, exams);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const slot = await prisma.examSchedule.update({ where:{id:req.params.id}, data:{ ...req.body, examDate: req.body.examDate ? new Date(req.body.examDate) : undefined } });
    return successResponse(res, slot, 'Sınav slotu güncellendi');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.examSchedule.delete({ where:{id:req.params.id} });
    return successResponse(res, null, 'Sınav slotu silindi');
  } catch (e) { next(e); }
});

export default router;
