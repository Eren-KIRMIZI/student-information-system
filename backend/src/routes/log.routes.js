import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';

const router = Router();
const paginate = (p=1, l=50) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page=1, limit=50, action, userId, startDate, endDate } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (action)    where.action = { contains: action, mode: 'insensitive' };
    if (userId)    where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate)   where.createdAt.lte = new Date(endDate);
    }
    const [data, total] = await Promise.all([
      prisma.log.findMany({ where, skip, take, orderBy:{createdAt:'desc'}, include:{ user:{select:{email:true,role:true}} } }),
      prisma.log.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

export default router;
