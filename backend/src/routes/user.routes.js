import { Router } from 'express';
import * as userRepository from '../repositories/user.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import { logEvent } from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const router = Router();
const paginate = (p=1, l=20) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

/**
 * GET /users/me — Oturum açan kullanıcının profili
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return next(new AppError('Kullanıcı bulunamadı', 404));
    const { password: _, ...safe } = user;
    return successResponse(res, {
      id: safe.id,
      email: safe.email,
      role: safe.role.name,
      isActive: safe.isActive,
      lastLoginAt: safe.lastLoginAt,
      profile: safe.student ?? safe.lecturer ?? null,
    });
  } catch (e) { next(e); }
});

/**
 * PUT /users/me — Profil güncelleme
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { phone, address } = req.body;
    if (req.user.role === 'STUDENT') {
      await prisma.student.updateMany({ where:{ userId:req.user.id }, data: { phone, address } });
    } else if (req.user.role === 'ACADEMICIAN') {
      await prisma.lecturer.updateMany({ where:{ userId:req.user.id }, data: { phone } });
    }
    const updated = await userRepository.findById(req.user.id);
    const { password: _, ...safe } = updated;
    return successResponse(res, safe, 'Profil güncellendi');
  } catch (e) { next(e); }
});

/**
 * GET /users — Admin: kullanıcı listesi
 */
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page=1, limit=20, search, roleId, isActive } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (roleId) where.roleId = roleId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) where.email = { contains: search, mode: 'insensitive' };
    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy:{createdAt:'desc'}, include:{ role:true } }),
      prisma.user.count({ where }),
    ]);
    const safe = data.map(({ password: _, ...u }) => u);
    return successResponse(res, { data: safe, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

/**
 * POST /users — Admin: kullanıcı oluştur
 */
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { email, password, roleId } = req.body;
    const exists = await prisma.user.findUnique({ where:{ email } });
    if (exists) return next(new AppError('Bu e-posta adresi zaten kullanımda', 409));
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data:{ email, password:hashed, roleId }, include:{ role:true } });
    const { password: _, ...safe } = user;
    await logEvent({ userId:req.user.id, action:'USER_CREATED', entity:'User', entityId:user.id });
    return successResponse(res, safe, 'Kullanıcı oluşturuldu', 201);
  } catch (e) { next(e); }
});

/**
 * PUT /users/:id — Admin: kullanıcı güncelle
 */
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where:{id:req.params.id}, data:{ roleId: req.body.roleId }, include:{role:true} });
    const { password: _, ...safe } = user;
    return successResponse(res, safe, 'Kullanıcı güncellendi');
  } catch (e) { next(e); }
});

/**
 * PUT /users/:id/status — Admin: aktif/pasif
 */
router.put('/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.user.update({ where:{id:req.params.id}, data:{ isActive: req.body.isActive } });
    await logEvent({ userId:req.user.id, action: req.body.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', entity:'User', entityId:req.params.id });
    return successResponse(res, null, `Kullanıcı ${req.body.isActive ? 'aktif' : 'pasif'} edildi`);
  } catch (e) { next(e); }
});

export default router;
