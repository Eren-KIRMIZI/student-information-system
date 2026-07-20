import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger/swagger.config.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { initSocket } from './src/config/socket.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import facultyRoutes from './src/routes/faculty.routes.js';
import departmentRoutes from './src/routes/department.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import lecturerRoutes from './src/routes/lecturer.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import courseSectionRoutes from './src/routes/courseSection.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import gradeRoutes from './src/routes/grade.routes.js';
import attendanceRoutes from './src/routes/attendance.routes.js';
import weeklyScheduleRoutes from './src/routes/weeklySchedule.routes.js';
import examScheduleRoutes from './src/routes/examSchedule.routes.js';
import announcementRoutes from './src/routes/announcement.routes.js';
import academicCalendarRoutes from './src/routes/academicCalendar.routes.js';
import advisorAssignmentRoutes from './src/routes/advisorAssignment.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import logRoutes from './src/routes/log.routes.js';
import roleRoutes from './src/routes/role.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads
app.use('/uploads', express.static('uploads'));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1/auth',               authRoutes);
app.use('/api/v1/users',              userRoutes);
app.use('/api/v1/dashboard',          dashboardRoutes);
app.use('/api/v1/faculties',          facultyRoutes);
app.use('/api/v1/departments',        departmentRoutes);
app.use('/api/v1/students',           studentRoutes);
app.use('/api/v1/lecturers',          lecturerRoutes);
app.use('/api/v1/courses',            courseRoutes);
app.use('/api/v1/course-sections',    courseSectionRoutes);
app.use('/api/v1/enrollments',        enrollmentRoutes);
app.use('/api/v1/grades',             gradeRoutes);
app.use('/api/v1/attendance',         attendanceRoutes);
app.use('/api/v1/weekly-schedule',    weeklyScheduleRoutes);
app.use('/api/v1/exam-schedule',      examScheduleRoutes);
app.use('/api/v1/announcements',      announcementRoutes);
app.use('/api/v1/academic-calendar',  academicCalendarRoutes);
app.use('/api/v1/advisor-assignments',advisorAssignmentRoutes);
app.use('/api/v1/uploads',            uploadRoutes);
app.use('/api/v1/logs',               logRoutes);
app.use('/api/v1/roles',              roleRoutes);

// Global Error Handler (en son middleware)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});

initSocket(server);

export default app;
