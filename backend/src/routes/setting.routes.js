import { Router } from 'express';
import { settingController } from '../controllers/setting.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', settingController.getAll);
router.get('/category/:category', settingController.getByCategory);
router.get('/:key', settingController.getByKey);
router.put('/:key', settingController.upsert);
router.delete('/:key', settingController.delete);

export default router;
