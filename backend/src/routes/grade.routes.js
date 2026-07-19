import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

// Letter grade → grade point map
const gradePointMap = { AA:4.0, BA:3.5, BB:3.0, CB:2.5, CC:2.0, DC:1.5, DD:1.0, FD:0.5, FF:0.0 };

// Student's own grades
router.get('/me', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({where:{userId:req.user.id},select:{id:true}});
    if (!student) return next(new AppError('Profil bulunamadı', 404));
    const grades = await prisma.grade.findMany({
      where: { enrollment: { studentId: student.id } },
      include: { enrollment: { include: { courseSection: { include: { course: true, lecturer: true } } } } },
    });
    return successResponse(res, grades);
  } catch (e) { next(e); }
});

// Student transcript
router.get('/transcript/me', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where:{userId:req.user.id}, include: { department: { include: { faculty: true } } } });
    if (!student) return next(new AppError('Profil bulunamadı', 404));
    const grades = await prisma.grade.findMany({
      where: { enrollment: { studentId: student.id }, isFinalized: true },
      include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    });
    const totalCredits  = grades.reduce((s, g) => s + g.enrollment.courseSection.course.credit, 0);
    const totalPoints   = grades.reduce((s, g) => s + ((g.gradePoint ?? 0) * g.enrollment.courseSection.course.credit), 0);
    const gpa = totalCredits > 0 ? Math.round((totalPoints/totalCredits)*100)/100 : 0;
    return successResponse(res, { student, grades, gpa, totalCredits });
  } catch (e) { next(e); }
});

// Update grade (academician/admin)
router.put('/:enrollmentId', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const { midtermScore, finalScore, makeupScore } = req.body;
    const lecturer = req.user.role === 'ACADEMICIAN' ? await prisma.lecturer.findUnique({where:{userId:req.user.id},select:{id:true}}) : null;

    // Compute letter grade
    let computedLetter = null, gradePoint = null;
    const effectiveFinal = makeupScore ?? finalScore;
    if (midtermScore !== undefined && effectiveFinal !== undefined && midtermScore !== null && effectiveFinal !== null) {
      const weighted = midtermScore * 0.4 + effectiveFinal * 0.6;
      if      (weighted >= 90) { computedLetter = 'AA'; gradePoint = 4.0; }
      else if (weighted >= 85) { computedLetter = 'BA'; gradePoint = 3.5; }
      else if (weighted >= 80) { computedLetter = 'BB'; gradePoint = 3.0; }
      else if (weighted >= 75) { computedLetter = 'CB'; gradePoint = 2.5; }
      else if (weighted >= 70) { computedLetter = 'CC'; gradePoint = 2.0; }
      else if (weighted >= 65) { computedLetter = 'DC'; gradePoint = 1.5; }
      else if (weighted >= 60) { computedLetter = 'DD'; gradePoint = 1.0; }
      else if (weighted >= 50) { computedLetter = 'FD'; gradePoint = 0.5; }
      else                     { computedLetter = 'FF'; gradePoint = 0.0; }
    }

    const grade = await prisma.grade.upsert({
      where: { enrollmentId: req.params.enrollmentId },
      update: { midtermScore, finalScore, makeupScore, letterGrade: computedLetter, gradePoint, enteredById: lecturer?.id },
      create: { enrollmentId: req.params.enrollmentId, midtermScore, finalScore, makeupScore, letterGrade: computedLetter, gradePoint, enteredById: lecturer?.id },
    });
    return successResponse(res, grade, 'Not kaydedildi');
  } catch (e) { next(e); }
});

router.put('/:enrollmentId/finalize', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const grade = await prisma.grade.update({ where:{enrollmentId:req.params.enrollmentId}, data:{isFinalized:true} });
    return successResponse(res, grade, 'Not kesinleştirildi');
  } catch (e) { next(e); }
});

export default router;
