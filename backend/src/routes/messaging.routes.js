import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/messaging.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getConversations);
router.post('/', ctrl.startConversation);
router.get('/:id/messages', ctrl.getConversationMessages);
router.post('/:id/messages', ctrl.sendMessage);
router.put('/:id/read', ctrl.markAsRead);

export default router;
