import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/courseSection.controller.js';
import { createCourseSectionValidator, updateCourseSectionValidator } from '../validators/courseSection.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/course-sections/:
 *   get:
 *     tags: [Course Sections]
 *     summary: Tüm ders bölümlerini listeleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Ders ID ile filtreleme
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Dönem filtresi
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Yıl filtresi
 *       - in: query
 *         name: lecturerId
 *         schema:
 *           type: string
 *         description: Akademisyen ID ile filtreleme
 *     responses:
 *       200:
 *         description: Ders bölümü listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/', authenticate, ctrl.listCourseSections);

/**
 * @swagger
 * /api/v1/course-sections/{id}:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümü detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Ders bölümü detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id', authenticate, ctrl.getCourseSectionById);

/**
 * @swagger
 * /api/v1/course-sections/:
 *   post:
 *     tags: [Course Sections]
 *     summary: Yeni ders bölümü oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, sectionCode, semester, year, lecturerId]
 *             properties:
 *               courseId:
 *                 type: string
 *               sectionCode:
 *                 type: string
 *               semester:
 *                 type: string
 *                 enum: [FALL, SPRING, SUMMER]
 *               year:
 *                 type: integer
 *               lecturerId:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               classroom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ders bölümü oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: Ders bölümü kodu zaten mevcut
 */
router.post('/', authenticate, authorize('ADMIN'), createCourseSectionValidator, validate, ctrl.createCourseSection);

/**
 * @swagger
 * /api/v1/course-sections/{id}:
 *   put:
 *     tags: [Course Sections]
 *     summary: Ders bölümü güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionCode:
 *                 type: string
 *               lecturerId:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               classroom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ders bölümü güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateCourseSectionValidator, validate, ctrl.updateCourseSection);

/**
 * @swagger
 * /api/v1/course-sections/{id}/archive:
 *   put:
 *     tags: [Course Sections]
 *     summary: Ders bölümünü arşivleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Ders bölümü arşivlendi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.put('/:id/archive', authenticate, authorize('ADMIN'), ctrl.archiveCourseSection);

/**
 * @swagger
 * /api/v1/course-sections/{id}:
 *   delete:
 *     tags: [Course Sections]
 *     summary: Ders bölümünü silme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Ders bölümü silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteCourseSection);

// Inline sub-routes for course section details (grades, attendance, schedule, materials)
import prisma from '../config/prisma.js';
import { successResponse } from '../utils/response.util.js';
import * as attendanceCtrl from '../controllers/attendance.controller.js';
import * as weeklyScheduleCtrl from '../controllers/weeklySchedule.controller.js';
import * as examScheduleCtrl from '../controllers/examSchedule.controller.js';
import { createWeeklySlotValidator } from '../validators/weeklySchedule.validator.js';
import { createExamSlotValidator } from '../validators/examSchedule.validator.js';

/**
 * @swagger
 * /api/v1/course-sections/{id}/grades:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümünün notlarını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Ders bölümü notları döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id/grades', authenticate, authorize('ADMIN', 'ACADEMICIAN'), async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseSectionId: req.params.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { student: true, grade: true },
      orderBy: { student: { lastName: 'asc' } },
    });
    return successResponse(res, enrollments);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/v1/course-sections/{id}/attendance:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümünün devam durumunu getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Devam durumu listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id/attendance', authenticate, authorize('ADMIN', 'ACADEMICIAN'), attendanceCtrl.getSectionAttendance);

/**
 * @swagger
 * /api/v1/course-sections/{id}/attendance:
 *   post:
 *     tags: [Course Sections]
 *     summary: Ders bölümünde devam kaydı oluşturma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, date, status]
 *             properties:
 *               studentId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, EXCUSED, LATE]
 *     responses:
 *       201:
 *         description: Devam kaydı oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.post('/:id/attendance', authenticate, authorize('ACADEMICIAN'), attendanceCtrl.recordAttendance);

/**
 * @swagger
 * /api/v1/course-sections/{id}/weekly-schedule:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümünün haftalık ders programını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Haftalık ders programı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id/weekly-schedule', authenticate, weeklyScheduleCtrl.getSectionWeeklySchedule);

/**
 * @swagger
 * /api/v1/course-sections/{id}/weekly-schedule:
 *   post:
 *     tags: [Course Sections]
 *     summary: Haftalık ders programına slot ekleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [day, startTime, endTime, classroom]
 *             properties:
 *               day:
 *                 type: string
 *                 enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               classroom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Haftalık slot oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 *       409:
 *         description: Zaman çakışması
 */
router.post('/:id/weekly-schedule', authenticate, authorize('ADMIN'), createWeeklySlotValidator, validate, weeklyScheduleCtrl.createWeeklySlot);

/**
 * @swagger
 * /api/v1/course-sections/{id}/exam-schedule:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümünün sınav programını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Sınav programı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id/exam-schedule', authenticate, examScheduleCtrl.getSectionExamSchedule);

/**
 * @swagger
 * /api/v1/course-sections/{id}/exam-schedule:
 *   post:
 *     tags: [Course Sections]
 *     summary: Sınav programına sınav ekleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, startTime, endTime, classroom]
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               classroom:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [MIDTERM, FINAL, QUIZ, PROJECT]
 *     responses:
 *       201:
 *         description: Sınav slotu oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bölümü bulunamadı
 *       409:
 *         description: Sınav zaman çakışması
 */
router.post('/:id/exam-schedule', authenticate, authorize('ADMIN'), createExamSlotValidator, validate, examScheduleCtrl.createExamSlot);

/**
 * @swagger
 * /api/v1/course-sections/{id}/materials:
 *   get:
 *     tags: [Course Sections]
 *     summary: Ders bölümünün ders materyallerini getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders bölümü ID
 *     responses:
 *       200:
 *         description: Ders materyalleri listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Ders bölümü bulunamadı
 */
router.get('/:id/materials', authenticate, async (req, res, next) => {
  try {
    const materials = await prisma.upload.findMany({ where: { courseSectionId: req.params.id, purpose: 'COURSE_MATERIAL' }, orderBy: { createdAt: 'desc' } });
    return successResponse(res, materials);
  } catch (e) { next(e); }
});

export default router;
