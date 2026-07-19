import { Router } from 'express';
import * as svc from '../services/academic.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.listDepartments(req.query)); } catch (e) { next(e); }
});
router.get('/:id', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.getDepartmentById(req.params.id)); } catch (e) { next(e); }
});
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.createDepartment(req.body), 'Bölüm oluşturuldu', 201); } catch (e) { next(e); }
});
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.updateDepartment(req.params.id, req.body), 'Bölüm güncellendi'); } catch (e) { next(e); }
});
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { await svc.deleteDepartment(req.params.id); return successResponse(res, null, 'Bölüm silindi'); } catch (e) { next(e); }
});

export default router;
