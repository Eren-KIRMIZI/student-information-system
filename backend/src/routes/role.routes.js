import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({ include: { _count: { select: { users: true } } } });
    return successResponse(res, roles);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const role = await prisma.role.update({ where:{id:req.params.id}, data:{ description: req.body.description } });
    return successResponse(res, role, 'Rol güncellendi');
  } catch (e) { next(e); }
});

export default router;
