import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

router.get('/me', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
    if (!student) return next(new AppError('Profil bulunamadı', 404));
    const data = await prisma.attendance.findMany({
      where: { enrollment: { studentId: student.id } },
      include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
      orderBy: { date: 'desc' },
    });
    return successResponse(res, data);
  } catch (e) { next(e); }
});

export default router;
