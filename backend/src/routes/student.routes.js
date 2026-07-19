import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

const router = Router();

const paginate = (p=1, l=20) => ({ skip:(Number(p)-1)*Number(l), take:Number(l) });

// Student routes
router.get('/', authenticate, authorize('ADMIN','ACADEMICIAN'), async (req, res, next) => {
  try {
    const { page=1, limit=20, search, departmentId, classYear, sortBy='createdAt', order='desc' } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (classYear) where.classYear = Number(classYear);
    if (search) where.OR = [{ firstName:{contains:search,mode:'insensitive'} },{ lastName:{contains:search,mode:'insensitive'} },{ studentNumber:{contains:search} }];
    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, skip, take, orderBy:{[sortBy]:order}, include:{ department:{include:{faculty:true}}, user:{select:{email:true,isActive:true,lastLoginAt:true}} } }),
      prisma.student.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{ page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit) } });
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where:{id:req.params.id}, include:{ department:{include:{faculty:true}}, user:{select:{email:true,isActive:true}}, advisorHistory:{include:{lecturer:true},where:{isActive:true}}, enrollments:{include:{courseSection:{include:{course:true}}},take:5,orderBy:{createdAt:'desc'}} } });
    if (!student) return next({statusCode:404,message:'Öğrenci bulunamadı',isOperational:true});
    // STUDENT kendisi kontrolü
    if (req.user.role === 'STUDENT') {
      const me = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
      if (me?.id !== student.id) return next({statusCode:403,message:'Bu kayda erişim yetkiniz yok',isOperational:true});
    }
    return successResponse(res, student);
  } catch (e) { next(e); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, studentNumber, nationalId, departmentId, classYear, phone, address, birthDate, roleId } = req.body;
    // Rol bul
    const role = await prisma.role.findUnique({ where:{name:'STUDENT'} });
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data:{ email, password: await bcrypt.hash(password,12), roleId: role.id } });
      const student = await tx.student.create({ data:{ userId:user.id, firstName, lastName, studentNumber, nationalId, departmentId, classYear:Number(classYear)||1, phone, address, birthDate:birthDate?new Date(birthDate):null }, include:{ department:true, user:{select:{email:true}} } });
      return student;
    });
    return successResponse(res, result, 'Öğrenci oluşturuldu', 201);
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{id:req.params.id},select:{id:true,userId:true}});
    if (!student) return next({statusCode:404,message:'Öğrenci bulunamadı',isOperational:true});
    // STUDENT sadece kendi telefon/adres bilgisini güncelleyebilir
    const isOwner = req.user.role==='STUDENT' && (await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}}))?.id===student.id;
    const isAdmin = req.user.role==='ADMIN';
    if (!isOwner && !isAdmin) return next({statusCode:403,message:'Yetki yok',isOperational:true});
    const allowedFields = isAdmin ? req.body : { phone:req.body.phone, address:req.body.address };
    const updated = await prisma.student.update({ where:{id:req.params.id}, data:allowedFields, include:{department:true} });
    return successResponse(res, updated, 'Öğrenci güncellendi');
  } catch (e) { next(e); }
});

router.put('/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{id:req.params.id},select:{userId:true}});
    if (!student) return next({statusCode:404,message:'Öğrenci bulunamadı',isOperational:true});
    await prisma.user.update({where:{id:student.userId},data:{isActive:req.body.isActive}});
    return successResponse(res, null, `Öğrenci ${req.body.isActive?'aktif':'pasif'} edildi`);
  } catch (e) { next(e); }
});

export default router;
