import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// ---- Auth Pages ----
const Login          = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/auth/ResetPassword'));

// ---- Common Pages ----
const RoleRedirect   = lazy(() => import('../pages/RoleRedirect'));
const Forbidden      = lazy(() => import('../pages/Forbidden'));
const NotFound       = lazy(() => import('../pages/NotFound'));

// ---- Layouts ----
const AuthLayout        = lazy(() => import('../layouts/AuthLayout'));
const StudentLayout     = lazy(() => import('../layouts/StudentLayout'));
const AcademicianLayout = lazy(() => import('../layouts/AcademicianLayout'));
const AdminLayout       = lazy(() => import('../layouts/AdminLayout'));
const SharedLayout      = lazy(() => import('../layouts/SharedLayout'));

// ---- Student Pages ----
const StudentDashboard  = lazy(() => import('../pages/student/Dashboard'));
const WeeklySchedule    = lazy(() => import('../pages/student/WeeklySchedule'));
const ExamSchedule      = lazy(() => import('../pages/student/ExamSchedule'));
const MyGrades          = lazy(() => import('../pages/student/MyGrades'));
const Transcript        = lazy(() => import('../pages/student/Transcript'));
const CourseCatalog     = lazy(() => import('../pages/student/CourseCatalog'));
const CourseSelection   = lazy(() => import('../pages/student/CourseSelection'));
const MyAttendance      = lazy(() => import('../pages/student/MyAttendance'));
const GraduationCheck   = lazy(() => import('../pages/student/GraduationCheck'));
const StudentAnalytics  = lazy(() => import('../pages/student/Analytics'));
const QRScan            = lazy(() => import('../pages/student/QRScan'));
const ScheduleOptimizer = lazy(() => import('../pages/student/ScheduleOptimizer'));

// ---- Academician Pages ----
const AcademicianDashboard = lazy(() => import('../pages/academician/Dashboard'));
const MyCourseSections     = lazy(() => import('../pages/academician/MyCourseSections'));
const CourseSectionWorkspaceAcademician = lazy(() => import('../pages/academician/CourseSectionWorkspace'));
const Advisees             = lazy(() => import('../pages/academician/Advisees'));
const MyTeachingSchedule   = lazy(() => import('../pages/academician/MyTeachingSchedule'));
const AdvisorAnalytics     = lazy(() => import('../pages/academician/AdvisorAnalytics'));
const QRGenerator          = lazy(() => import('../pages/academician/QRGenerator'));

// ---- Admin Pages ----
const AdminDashboard          = lazy(() => import('../pages/admin/Dashboard'));
const AdminDashboardEnhanced  = lazy(() => import('../pages/admin/DashboardEnhanced'));
const UserList                = lazy(() => import('../pages/admin/UserList'));
const RoleList                = lazy(() => import('../pages/admin/RoleList'));
const FacultyList             = lazy(() => import('../pages/admin/FacultyList'));
const DepartmentList          = lazy(() => import('../pages/admin/DepartmentList'));
const StudentList             = lazy(() => import('../pages/admin/StudentList'));
const StudentDetail           = lazy(() => import('../pages/admin/StudentDetail'));
const LecturerList            = lazy(() => import('../pages/admin/LecturerList'));
const LecturerDetail          = lazy(() => import('../pages/admin/LecturerDetail'));
const CourseList              = lazy(() => import('../pages/admin/CourseList'));
const CourseSectionList       = lazy(() => import('../pages/admin/CourseSectionList'));
const CourseSectionWorkspaceAdmin = lazy(() => import('../pages/admin/CourseSectionWorkspace'));
const AdvisorAssignmentList   = lazy(() => import('../pages/admin/AdvisorAssignmentList'));
const LogList                 = lazy(() => import('../pages/admin/LogList'));
const AuditViewer             = lazy(() => import('../pages/admin/AuditViewer'));

// ---- Shared Pages ----
const AnnouncementList   = lazy(() => import('../pages/shared/AnnouncementList'));
const AnnouncementDetail = lazy(() => import('../pages/shared/AnnouncementDetail'));
const AcademicCalendar   = lazy(() => import('../pages/shared/AcademicCalendar'));
const Profile            = lazy(() => import('../pages/shared/Profile'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login"            element={<Login />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
      </Route>

      {/* Role redirect */}
      <Route element={<ProtectedRoute />}>
        <Route path="/"        element={<RoleRedirect />} />
      </Route>

      {/* Shared (all roles) */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ACADEMICIAN', 'ADMIN']} />}>
        <Route element={<SharedLayout />}>
          <Route path="/announcements"            element={<AnnouncementList />} />
          <Route path="/announcements/:id"        element={<AnnouncementDetail />} />
          <Route path="/academic-calendar"        element={<AcademicCalendar />} />
          <Route path="/profile"                  element={<Profile />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard"        element={<StudentDashboard />} />
          <Route path="/student/schedule"         element={<WeeklySchedule />} />
          <Route path="/student/exams"            element={<ExamSchedule />} />
          <Route path="/student/grades"           element={<MyGrades />} />
          <Route path="/student/transcript"       element={<Transcript />} />
          <Route path="/student/course-catalog"   element={<CourseCatalog />} />
          <Route path="/student/course-selection" element={<CourseSelection />} />
          <Route path="/student/attendance"       element={<MyAttendance />} />
          <Route path="/student/graduation"       element={<GraduationCheck />} />
          <Route path="/student/analytics"        element={<StudentAnalytics />} />
          <Route path="/student/qr-scan"          element={<QRScan />} />
          <Route path="/student/schedule-analysis" element={<ScheduleOptimizer />} />
        </Route>
      </Route>

      {/* Academician */}
      <Route element={<ProtectedRoute allowedRoles={['ACADEMICIAN']} />}>
        <Route element={<AcademicianLayout />}>
          <Route path="/academician/dashboard"            element={<AcademicianDashboard />} />
          <Route path="/academician/course-sections"      element={<MyCourseSections />} />
          <Route path="/academician/course-sections/:id"  element={<CourseSectionWorkspaceAcademician />} />
          <Route path="/academician/advisees"             element={<Advisees />} />
          <Route path="/academician/my-schedule"          element={<MyTeachingSchedule />} />
          <Route path="/academician/advisor-analytics"    element={<AdvisorAnalytics />} />
          <Route path="/academician/qr-generator"         element={<QRGenerator />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"                element={<AdminDashboard />} />
          <Route path="/admin/dashboard-enhanced"       element={<AdminDashboardEnhanced />} />
          <Route path="/admin/users"                    element={<UserList />} />
          <Route path="/admin/roles"                    element={<RoleList />} />
          <Route path="/admin/faculties"                element={<FacultyList />} />
          <Route path="/admin/departments"              element={<DepartmentList />} />
          <Route path="/admin/students"                 element={<StudentList />} />
          <Route path="/admin/students/:id"             element={<StudentDetail />} />
          <Route path="/admin/lecturers"                element={<LecturerList />} />
          <Route path="/admin/lecturers/:id"            element={<LecturerDetail />} />
          <Route path="/admin/courses"                  element={<CourseList />} />
          <Route path="/admin/course-sections"          element={<CourseSectionList />} />
          <Route path="/admin/course-sections/:id"      element={<CourseSectionWorkspaceAdmin />} />
          <Route path="/admin/advisor-assignments"      element={<AdvisorAssignmentList />} />
          <Route path="/admin/logs"                     element={<LogList />} />
          <Route path="/admin/audit-logs"               element={<AuditViewer />} />
        </Route>
      </Route>

      {/* Error pages */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*"    element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
