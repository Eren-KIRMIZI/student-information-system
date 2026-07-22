import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', searchController.searchAll);
router.get('/students', searchController.searchStudents);
router.get('/lecturers', searchController.searchLecturers);
router.get('/courses', searchController.searchCourses);

export default router;
