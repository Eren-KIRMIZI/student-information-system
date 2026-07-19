import { Router } from 'express';
import * as svc from '../services/academic.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.listFaculties(req.query)); } catch (e) { next(e); }
});
router.get('/:id', authenticate, async (req, res, next) => {
  try { return successResponse(res, await svc.getFacultyById(req.params.id)); } catch (e) { next(e); }
});
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.createFaculty(req.body), 'Fakülte oluşturuldu', 201); } catch (e) { next(e); }
});
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { return successResponse(res, await svc.updateFaculty(req.params.id, req.body), 'Fakülte güncellendi'); } catch (e) { next(e); }
});
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try { await svc.deleteFaculty(req.params.id); return successResponse(res, null, 'Fakülte silindi'); } catch (e) { next(e); }
});

export default router;
