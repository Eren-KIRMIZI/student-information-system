import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';

const router = Router();
const paginate = (p=1, l=20) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page=1, limit=50, category } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = category ? { category } : {};
    const [data, total] = await Promise.all([
      prisma.academicCalendar.findMany({ where, skip, take, orderBy:{startDate:'asc'} }),
      prisma.academicCalendar.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const event = await prisma.academicCalendar.create({
      data:{ ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) }
    });
    return successResponse(res, event, 'Etkinlik oluşturuldu', 201);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const d = { ...req.body };
    if (d.startDate) d.startDate = new Date(d.startDate);
    if (d.endDate)   d.endDate   = new Date(d.endDate);
    const event = await prisma.academicCalendar.update({ where:{id:req.params.id}, data:d });
    return successResponse(res, event, 'Etkinlik güncellendi');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.academicCalendar.delete({ where:{id:req.params.id} });
    return successResponse(res, null, 'Etkinlik silindi');
  } catch (e) { next(e); }
});

export default router;
