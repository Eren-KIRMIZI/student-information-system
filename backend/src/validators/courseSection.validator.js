import { body, param, query } from 'express-validator';

export const createCourseSectionValidator = [
  body('courseId').isUUID().withMessage('Ders ID zorunludur'),
  body('sectionCode').trim().notEmpty().withMessage('Şube kodu zorunludur').isLength({ max: 10 }),
  body('academicYear').trim().notEmpty().withMessage('Akademik yıl zorunludur'),
  body('semester').isIn(['FALL', 'SPRING', 'SUMMER']).withMessage('Geçersiz dönem'),
  body('quota').isInt({ min: 1 }).withMessage('Kontenjan en az 1 olmalıdır'),
  body('lecturerId').optional({ values: 'null' }).isUUID(),
  body('classroom').optional().trim().isLength({ max: 50 }),
];

export const updateCourseSectionValidator = [
  param('id').isUUID().withMessage('Geçersiz şube ID'),
  body('courseId').optional().isUUID(),
  body('sectionCode').optional().trim().notEmpty().isLength({ max: 10 }),
  body('academicYear').optional().trim().notEmpty(),
  body('semester').optional().isIn(['FALL', 'SPRING', 'SUMMER']),
  body('quota').optional().isInt({ min: 1 }),
  body('lecturerId').optional({ values: 'null' }).isUUID(),
  body('classroom').optional().trim().isLength({ max: 50 }),
];
