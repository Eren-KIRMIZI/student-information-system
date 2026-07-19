import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

const router = Router();
const paginate = (p=1, l=20) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page=1, limit=20, search, departmentId, sortBy='createdAt', order='desc' } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) where.OR = [{ firstName:{contains:search,mode:'insensitive'} },{ lastName:{contains:search,mode:'insensitive'} },{ title:{contains:search,mode:'insensitive'} }];
    const [data, total] = await Promise.all([
      prisma.lecturer.findMany({ where, skip, take, orderBy:{[sortBy]:order}, include:{ department:{include:{faculty:true}}, user:{select:{email:true,isActive:true,lastLoginAt:true}} } }),
      prisma.lecturer.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{ page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit) } });
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const lecturer = await prisma.lecturer.findUnique({ where:{id:req.params.id}, include:{ department:{include:{faculty:true}}, user:{select:{email:true,isActive:true}}, sections:{include:{course:true},take:5,orderBy:{createdAt:'desc'}} } });
    if (!lecturer) return next({statusCode:404,message:'Akademisyen bulunamadı',isOperational:true});
    return successResponse(res, lecturer);
  } catch (e) { next(e); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, title, departmentId, phone } = req.body;
    const role = await prisma.role.findUnique({ where:{name:'ACADEMICIAN'} });
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data:{ email, password:await bcrypt.hash(password,12), roleId:role.id } });
      return tx.lecturer.create({ data:{ userId:user.id, firstName, lastName, title, departmentId, phone }, include:{ department:true, user:{select:{email:true}} } });
    });
    return successResponse(res, result, 'Akademisyen oluşturuldu', 201);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const lecturer = await prisma.lecturer.findUnique({where:{id:req.params.id},select:{id:true,userId:true}});
    if (!lecturer) return next({statusCode:404,message:'Akademisyen bulunamadı',isOperational:true});
    const isOwner = req.user.role==='ACADEMICIAN' && (await prisma.lecturer.findUnique({where:{userId:req.user.id},select:{id:true}}))?.id===lecturer.id;
    const isAdmin = req.user.role==='ADMIN';
    if (!isOwner && !isAdmin) return next({statusCode:403,message:'Yetki yok',isOperational:true});
    const allowedFields = isAdmin ? req.body : { phone:req.body.phone };
    const updated = await prisma.lecturer.update({ where:{id:req.params.id}, data:allowedFields, include:{department:true} });
    return successResponse(res, updated, 'Akademisyen güncellendi');
  } catch (e) { next(e); }
});

router.put('/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const lecturer = await prisma.lecturer.findUnique({where:{id:req.params.id},select:{userId:true}});
    if (!lecturer) return next({statusCode:404,message:'Akademisyen bulunamadı',isOperational:true});
    await prisma.user.update({where:{id:lecturer.userId},data:{isActive:req.body.isActive}});
    return successResponse(res, null, `Akademisyen ${req.body.isActive?'aktif':'pasif'} edildi`);
  } catch (e) { next(e); }
});

export default router;
