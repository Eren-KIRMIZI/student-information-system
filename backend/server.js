import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger/swagger.config.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { initSocket } from './src/config/socket.js';
import { requestId } from './src/middlewares/requestId.middleware.js';
import { compressionMiddleware } from './src/middlewares/compression.middleware.js';
import { maintenanceCheck } from './src/middlewares/maintenance.middleware.js';
import { etagMiddleware } from './src/middlewares/etag.middleware.js';
import { auditMiddleware } from './src/utils/audit.js';
import { tracingMiddleware } from './src/middlewares/tracing.middleware.js';
import { httpLogger } from './src/middlewares/httpLogger.middleware.js';
import { metricsMiddleware } from './src/middlewares/metrics.middleware.js';
import { setupScheduledJobs } from './src/queue/scheduler.js';
import { authenticate } from './src/middlewares/auth.middleware.js';
import { logger } from './src/utils/winstonLogger.js';
import healthRoutes from './src/routes/health.routes.js';
import metricsRoutes from './src/routes/metrics.routes.js';

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
import materialRoutes from './src/routes/material.routes.js';
import messagingRoutes from './src/routes/messaging.routes.js';
import logRoutes from './src/routes/log.routes.js';
import roleRoutes from './src/routes/role.routes.js';
import settingRoutes from './src/routes/setting.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import prerequisiteRoutes from './src/routes/prerequisite.routes.js';
import waitlistRoutes from './src/routes/waitlist.routes.js';
import qrAttendanceRoutes from './src/routes/qrAttendance.routes.js';
import graduationRoutes from './src/routes/graduation.routes.js';
import studentAnalyticsRoutes from './src/routes/studentAnalytics.routes.js';
import advisorAnalyticsRoutes from './src/routes/advisorAnalytics.routes.js';
import scheduleOptimizerRoutes from './src/routes/scheduleOptimizer.routes.js';
import adminDashboardRoutes from './src/routes/adminDashboard.routes.js';
import exportRoutes from './src/routes/export.routes.js';
import importRoutes from './src/routes/import.routes.js';
import { idempotencyMiddleware } from './src/middlewares/idempotency.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Global Middlewares
app.use(requestId);
app.use(compressionMiddleware);
app.use(maintenanceCheck);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400,
}));
app.use(httpLogger);
app.use(metricsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(etagMiddleware);
app.use(auditMiddleware);
app.use(tracingMiddleware);

// Static uploads — auth required
app.use('/uploads', authenticate, express.static('uploads'));

// Health check & Metrics — auth gerektirmez
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

// Swagger Docs — production'da devre dışı bırakılabilir
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

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
app.use('/api/v1/materials',          materialRoutes);
app.use('/api/v1/messaging',          messagingRoutes);
app.use('/api/v1/logs',               logRoutes);
app.use('/api/v1/roles',              roleRoutes);
app.use('/api/v1/settings',           settingRoutes);
app.use('/api/v1/search',             searchRoutes);
app.use('/api/v1/prerequisites',       prerequisiteRoutes);
app.use('/api/v1/waitlist',            waitlistRoutes);
app.use('/api/v1/qr-attendance',       qrAttendanceRoutes);
app.use('/api/v1/academic',            graduationRoutes);
app.use('/api/v1/student-analytics',   studentAnalyticsRoutes);
app.use('/api/v1/advisor-analytics',   advisorAnalyticsRoutes);
app.use('/api/v1/schedule-optimizer',  scheduleOptimizerRoutes);
app.use('/api/v1/admin-dashboard',     adminDashboardRoutes);
app.use('/api/v1/export',              exportRoutes);
app.use('/api/v1/import',              importRoutes);

// Idempotency — route'lardan SONRA mount et, handler içinde çalışır
app.use(['/api/v1/enrollments', '/api/v1/grades', '/api/v1/announcements'], idempotencyMiddleware);

// Global Error Handler (en son middleware)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    swagger: `http://localhost:${PORT}/api-docs`,
    health:  `http://localhost:${PORT}/health`,
    metrics: `http://localhost:${PORT}/metrics`,
  });
});

initSocket(server);

if (process.env.QUEUE_ENABLED === 'true') {
  setupScheduledJobs().catch(() => {});
}

export default app;
