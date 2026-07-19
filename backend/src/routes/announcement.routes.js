import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';

const router = Router();
const paginate = (p=1, l=10) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page=1, limit=10, category, targetRole } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (category) where.category = category;
    if (targetRole) where.targetRole = targetRole;
    else {
      const roleMap = { STUDENT: ['ALL','STUDENT'], ACADEMICIAN: ['ALL','ACADEMICIAN'], ADMIN: ['ALL','ADMIN','STUDENT','ACADEMICIAN'] };
      where.targetRole = { in: roleMap[req.user.role] || ['ALL'] };
    }
    const [data, total] = await Promise.all([
      prisma.announcement.findMany({ where, skip, take, orderBy:{publishedAt:'desc'}, include:{publishedBy:{select:{email:true}}} }),
      prisma.announcement.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const a = await prisma.announcement.findUnique({ where:{id:req.params.id}, include:{publishedBy:{select:{email:true}}} });
    if (!a) return next({statusCode:404,message:'Duyuru bulunamadı',isOperational:true});
    return successResponse(res, a);
  } catch (e) { next(e); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const a = await prisma.announcement.create({ data:{ ...req.body, publishedById: req.user.id }, include:{publishedBy:{select:{email:true}}} });
    return successResponse(res, a, 'Duyuru oluşturuldu', 201);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const a = await prisma.announcement.update({ where:{id:req.params.id}, data:req.body });
    return successResponse(res, a, 'Duyuru güncellendi');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.announcement.delete({ where:{id:req.params.id} });
    return successResponse(res, null, 'Duyuru silindi');
  } catch (e) { next(e); }
});

export default router;
