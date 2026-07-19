import * as svc from '../services/enrollment.service.js';
import { successResponse } from '../utils/response.util.js';

export const listEnrollments = async (req, res, next) => {
  try {
    const params = { ...req.query };
    if (req.user.role === 'STUDENT') {
      const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId: req.user.id }, select: { id: true } }));
      if (student) params.studentId = student.id;
    }
    return successResponse(res, await svc.listEnrollments(params));
  } catch (e) { next(e); }
};

export const getMyEnrollments = async (req, res, next) => {
  try { return successResponse(res, await svc.getMyEnrollments(req.user.id)); } catch (e) { next(e); }
};

export const createEnrollment = async (req, res, next) => {
  try { return successResponse(res, await svc.createEnrollment(req.user.id, req.body.courseSectionId), 'Ders seçme talebiniz alındı', 201); } catch (e) { next(e); }
};

export const approveEnrollment = async (req, res, next) => {
  try { return successResponse(res, await svc.approveEnrollment(req.params.id), 'Kayıt onaylandı'); } catch (e) { next(e); }
};

export const rejectEnrollment = async (req, res, next) => {
  try { return successResponse(res, await svc.rejectEnrollment(req.params.id), 'Kayıt reddedildi'); } catch (e) { next(e); }
};

export const dropEnrollment = async (req, res, next) => {
  try { return successResponse(res, await svc.dropEnrollment(req.params.id), 'Ders bırakıldı'); } catch (e) { next(e); }
};
