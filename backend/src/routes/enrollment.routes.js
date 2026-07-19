import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

// Get enrollments (admin/academician paginated, student gets own)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page=1, limit=20, status, courseSectionId } = req.query;
    const skip = (Number(page)-1)*Number(limit), take = Number(limit);
    const where = {};
    if (status) where.status = status;
    if (courseSectionId) where.courseSectionId = courseSectionId;
    // Students can only see their own
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
      if (!student) return next(new AppError('Öğrenci profili bulunamadı', 404));
      where.studentId = student.id;
    }
    const [data, total] = await Promise.all([
      prisma.enrollment.findMany({ where, skip, take, orderBy:{createdAt:'desc'}, include:{ student:true, courseSection:{include:{course:true,lecturer:true}} } }),
      prisma.enrollment.count({ where }),
    ]);
    return successResponse(res, { data, pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/limit)} });
  } catch (e) { next(e); }
});

// Student's own enrollments
router.get('/me', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
    if (!student) return next(new AppError('Profil bulunamadı', 404));
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { courseSection: { include: { course: true, lecturer: true, weeklySlots: true } }, grade: true },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, enrollments);
  } catch (e) { next(e); }
});

// Create enrollment (student ders seçme)
router.post('/', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
    if (!student) return next(new AppError('Öğrenci profili bulunamadı', 404));

    const { courseSectionId } = req.body;
    const section = await prisma.courseSection.findUnique({
      where: { id: courseSectionId },
      include: { _count: { select: { enrollments: true } }, course: true },
    });
    if (!section) return next(new AppError('Ders şubesi bulunamadı', 404));
    if (section.isArchived) return next(new AppError('Bu şube arşivlenmiş', 400));

    // Quota check
    const activeCount = await prisma.enrollment.count({ where: { courseSectionId, status: { in: ['ACTIVE','APPROVED','PENDING'] } } });
    if (activeCount >= section.quota) return next(new AppError('Kontenjan dolu', 400, null, 'QUOTA_FULL'));

    // Duplicate check
    const exists = await prisma.enrollment.findFirst({ where: { studentId: student.id, courseSectionId, status: { not: 'REJECTED' } } });
    if (exists) return next(new AppError('Bu derse zaten kayıtlısınız', 409, null, 'ALREADY_ENROLLED'));

    // ECTS check
    const currentEcts = await prisma.enrollment.findMany({
      where: { studentId: student.id, status: { in: ['ACTIVE','APPROVED','PENDING'] }, courseSection: { academicYear: section.academicYear, semester: section.semester } },
      include: { courseSection: { include: { course: true } } },
    }).then(list => list.reduce((s, e) => s + e.courseSection.course.ects, 0));

    const MAX_ECTS = Number(process.env.MAX_ECTS_PER_SEMESTER) || 45;
    if (currentEcts + section.course.ects > MAX_ECTS) {
      return next(new AppError(`Maksimum AKTS sınırı (${MAX_ECTS}) aşılıyor`, 400, null, 'ECTS_LIMIT_EXCEEDED'));
    }

    // Conflict check (weekly schedule)
    const mySlots = await prisma.weeklySchedule.findMany({
      where: { courseSection: { enrollments: { some: { studentId: student.id, status: { in: ['ACTIVE','APPROVED','PENDING'] } } } } },
    });
    const newSlots = await prisma.weeklySchedule.findMany({ where: { courseSectionId } });
    for (const ns of newSlots) {
      for (const ms of mySlots) {
        if (ns.dayOfWeek === ms.dayOfWeek) {
          const conflict = !(ns.endTime <= ms.startTime || ns.startTime >= ms.endTime);
          if (conflict) return next(new AppError('Ders programı çakışması var', 409, null, 'SCHEDULE_CONFLICT'));
        }
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: student.id, courseSectionId, status: 'PENDING' },
      include: { courseSection: { include: { course: true } } },
    });
    return successResponse(res, enrollment, 'Ders seçme talebiniz alındı', 201);
  } catch (e) { next(e); }
});

router.put('/:id/approve', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const updated = await prisma.enrollment.update({ where:{id:req.params.id}, data:{status:'ACTIVE'} });
    return successResponse(res, updated, 'Kayıt onaylandı');
  } catch (e) { next(e); }
});

router.put('/:id/reject', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const updated = await prisma.enrollment.update({ where:{id:req.params.id}, data:{status:'REJECTED'} });
    return successResponse(res, updated, 'Kayıt reddedildi');
  } catch (e) { next(e); }
});

router.put('/:id/drop', authenticate, async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({where:{id:req.params.id}});
    if (!enrollment) return next(new AppError('Kayıt bulunamadı', 404));
    if (enrollment.status === 'COMPLETED') return next(new AppError('Tamamlanmış ders bırakılamaz', 400));
    const updated = await prisma.enrollment.update({ where:{id:req.params.id}, data:{status:'DROPPED'} });
    return successResponse(res, updated, 'Ders bırakıldı');
  } catch (e) { next(e); }
});

export default router;
