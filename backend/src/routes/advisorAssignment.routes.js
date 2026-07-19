import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();
const paginate = (p=1, l=20) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page=1, limit=20, lecturerId, studentId } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (lecturerId) where.lecturerId = lecturerId;
    if (studentId)  where.studentId  = studentId;
    const [data, total] = await Promise.all([
      prisma.advisorAssignment.findMany({ where, skip, take, orderBy:{assignedAt:'desc'}, include:{ student:true, lecturer:true } }),
      prisma.advisorAssignment.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

// Academician — get own advisees
router.get('/lecturer/:id/students', authenticate, authorize('ADMIN','ACADEMICIAN'), async (req, res, next) => {
  try {
    const assignments = await prisma.advisorAssignment.findMany({
      where: { lecturerId: req.params.id, isActive: true },
      include: { student: { include: { department:true, user:{select:{email:true}} } } },
    });
    return successResponse(res, assignments.map(a => a.student));
  } catch (e) { next(e); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const assignment = await prisma.advisorAssignment.create({
      data: req.body, include:{ student:true, lecturer:true }
    });
    return successResponse(res, assignment, 'Danışman ataması yapıldı', 201);
  } catch (e) { next(e); }
});

router.put('/:id/deactivate', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const a = await prisma.advisorAssignment.update({ where:{id:req.params.id}, data:{isActive:false} });
    return successResponse(res, a, 'Atama pasif edildi');
  } catch (e) { next(e); }
});

export default router;
