import * as repo from '../repositories/academic.repository.js';
import { AppError } from '../utils/appError.util.js';

const paginate = (page, limit) => ({ skip: (Number(page)-1)*Number(limit), take: Number(limit) });

// ===== FACULTY SERVICE =====
export const listFaculties = async ({ page=1, limit=20, search, sortBy, order }) => {
  const [data, total] = await repo.facultyFindMany({ ...paginate(page,limit), search, sortBy, order });
  return { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
};
export const getFacultyById = async (id) => {
  const f = await repo.facultyFindById(id);
  if (!f) throw new AppError('Fakülte bulunamadı', 404);
  return f;
};
export const createFaculty = (data) => repo.facultyCreate(data);
export const updateFaculty = async (id, data) => {
  await getFacultyById(id);
  return repo.facultyUpdate(id, data);
};
export const deleteFaculty = async (id) => {
  await getFacultyById(id);
  const count = await repo.facultyHasDepts(id);
  if (count > 0) throw new AppError('Bu fakülteye bağlı bölümler var, önce onları kaldırın.', 409, null, 'HAS_DEPENDENTS');
  return repo.facultyDelete(id);
};

// ===== DEPARTMENT SERVICE =====
export const listDepartments = async ({ page=1, limit=100, search, facultyId, sortBy, order }) => {
  const [data, total] = await repo.deptFindMany({ ...paginate(page,limit), search, facultyId, sortBy, order });
  return { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
};
export const getDepartmentById = async (id) => {
  const d = await repo.deptFindById(id);
  if (!d) throw new AppError('Bölüm bulunamadı', 404);
  return d;
};
export const createDepartment = (data) => repo.deptCreate(data);
export const updateDepartment = async (id, data) => {
  await getDepartmentById(id);
  return repo.deptUpdate(id, data);
};
export const deleteDepartment = async (id) => {
  await getDepartmentById(id);
  const [s, l, c] = await repo.deptHasDependents(id);
  if (s+l+c > 0) throw new AppError('Bu bölüme bağlı öğrenci, akademisyen veya ders var.', 409, null, 'HAS_DEPENDENTS');
  return repo.deptDelete(id);
};

// ===== COURSE SERVICE =====
export const listCourses = async ({ page=1, limit=20, search, departmentId, sortBy, order }) => {
  const [data, total] = await repo.courseFindMany({ ...paginate(page,limit), search, departmentId, sortBy, order });
  return { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
};
export const getCourseById = async (id) => {
  const c = await repo.courseFindById(id);
  if (!c) throw new AppError('Ders bulunamadı', 404);
  return c;
};
export const createCourse = (data) => repo.courseCreate(data);
export const updateCourse = async (id, data) => {
  await getCourseById(id);
  return repo.courseUpdate(id, data);
};
export const deleteCourse = async (id) => {
  await getCourseById(id);
  const count = await repo.courseHasSections(id);
  if (count > 0) throw new AppError('Bu dersin açık şubeleri var, önce onları kapatın.', 409, null, 'HAS_DEPENDENTS');
  return repo.courseDelete(id);
};

// ===== COURSE SECTION SERVICE =====
export const listCourseSections = async ({ page=1, limit=20, academicYear, semester, departmentId, lecturerId, sortBy, order }) => {
  const [data, total] = await repo.sectionFindMany({ ...paginate(page,limit), academicYear, semester, departmentId, lecturerId, sortBy, order });
  return { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
};
export const getCourseSectionById = async (id) => {
  const s = await repo.sectionFindById(id);
  if (!s) throw new AppError('Ders şubesi bulunamadı', 404);
  return s;
};
export const createCourseSection = (data) => repo.sectionCreate(data);
export const updateCourseSection = async (id, data) => {
  await getCourseSectionById(id);
  return repo.sectionUpdate(id, data);
};
export const archiveCourseSection = async (id) => {
  await getCourseSectionById(id);
  return repo.sectionArchive(id);
};
export const deleteCourseSection = async (id) => {
  await getCourseSectionById(id);
  const count = await repo.sectionHasEnrollments(id);
  if (count > 0) throw new AppError('Bu şubede aktif kayıtlar var, silinemez.', 409, null, 'HAS_DEPENDENTS');
  return repo.sectionDelete(id);
};
