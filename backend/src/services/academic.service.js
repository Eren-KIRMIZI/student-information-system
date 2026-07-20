import * as repo from '../repositories/academic.repository.js';
import { AppError } from '../utils/appError.util.js';
import { cache } from '../utils/cache.js';

const paginate = (page, limit) => ({ skip: (Number(page)-1)*Number(limit), take: Number(limit) });

// ===== FACULTY SERVICE =====
export const listFaculties = async ({ page=1, limit=20, search, sortBy, order }) => {
  const cacheKey = `faculties:${JSON.stringify({page,limit,search,sortBy,order})}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  const [data, total] = await repo.facultyFindMany({ ...paginate(page,limit), search, sortBy, order });
  const result = { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
  await cache.set(cacheKey, result, 86400);
  return result;
};
export const getFacultyById = async (id) => {
  const f = await repo.facultyFindById(id);
  if (!f) throw new AppError('Fakülte bulunamadı', 404);
  return f;
};
export const createFaculty = async (data) => {
  const result = await repo.facultyCreate(data);
  await cache.invalidatePattern('faculties:*');
  return result;
};
export const updateFaculty = async (id, data) => {
  await getFacultyById(id);
  const result = await repo.facultyUpdate(id, data);
  await cache.invalidatePattern('faculties:*');
  return result;
};
export const deleteFaculty = async (id) => {
  await getFacultyById(id);
  const count = await repo.facultyHasDepts(id);
  if (count > 0) throw new AppError('Bu fakülteye bağlı bölümler var, önce onları kaldırın.', 409, null, 'HAS_DEPENDENTS');
  const result = await repo.facultyDelete(id);
  await cache.invalidatePattern('faculties:*');
  return result;
};

// ===== DEPARTMENT SERVICE =====
export const listDepartments = async ({ page=1, limit=100, search, facultyId, sortBy, order }) => {
  const cacheKey = `departments:${JSON.stringify({page,limit,search,facultyId,sortBy,order})}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  const [data, total] = await repo.deptFindMany({ ...paginate(page,limit), search, facultyId, sortBy, order });
  const result = { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
  await cache.set(cacheKey, result, 86400);
  return result;
};
export const getDepartmentById = async (id) => {
  const d = await repo.deptFindById(id);
  if (!d) throw new AppError('Bölüm bulunamadı', 404);
  return d;
};
export const createDepartment = async (data) => {
  const result = await repo.deptCreate(data);
  await cache.invalidatePattern('departments:*');
  return result;
};
export const updateDepartment = async (id, data) => {
  await getDepartmentById(id);
  const result = await repo.deptUpdate(id, data);
  await cache.invalidatePattern('departments:*');
  return result;
};
export const deleteDepartment = async (id) => {
  await getDepartmentById(id);
  const [s, l, c] = await repo.deptHasDependents(id);
  if (s+l+c > 0) throw new AppError('Bu bölüme bağlı öğrenci, akademisyen veya ders var.', 409, null, 'HAS_DEPENDENTS');
  const result = await repo.deptDelete(id);
  await cache.invalidatePattern('departments:*');
  return result;
};

// ===== COURSE SERVICE =====
export const listCourses = async ({ page=1, limit=20, search, departmentId, sortBy, order }) => {
  const cacheKey = `courses:${JSON.stringify({page,limit,search,departmentId,sortBy,order})}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  const [data, total] = await repo.courseFindMany({ ...paginate(page,limit), search, departmentId, sortBy, order });
  const result = { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
  await cache.set(cacheKey, result, 86400);
  return result;
};
export const getCourseById = async (id) => {
  const c = await repo.courseFindById(id);
  if (!c) throw new AppError('Ders bulunamadı', 404);
  return c;
};
export const createCourse = async (data) => {
  const result = await repo.courseCreate(data);
  await cache.invalidatePattern('courses:*');
  return result;
};
export const updateCourse = async (id, data) => {
  await getCourseById(id);
  const result = await repo.courseUpdate(id, data);
  await cache.invalidatePattern('courses:*');
  return result;
};
export const deleteCourse = async (id) => {
  await getCourseById(id);
  const count = await repo.courseHasSections(id);
  if (count > 0) throw new AppError('Bu dersin açık şubeleri var, önce onları kapatın.', 409, null, 'HAS_DEPENDENTS');
  const result = await repo.courseDelete(id);
  await cache.invalidatePattern('courses:*');
  return result;
};

// ===== COURSE SECTION SERVICE =====
export const listCourseSections = async ({ page=1, limit=20, academicYear, semester, departmentId, lecturerId, sortBy, order }) => {
  const cacheKey = `sections:${JSON.stringify({page,limit,academicYear,semester,departmentId,lecturerId,sortBy,order})}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  const [data, total] = await repo.sectionFindMany({ ...paginate(page,limit), academicYear, semester, departmentId, lecturerId, sortBy, order });
  const result = { data, pagination: { page:Number(page), limit:Number(limit), total, totalPages: Math.ceil(total/limit) } };
  await cache.set(cacheKey, result, 3600);
  return result;
};
export const getCourseSectionById = async (id) => {
  const s = await repo.sectionFindById(id);
  if (!s) throw new AppError('Ders şubesi bulunamadı', 404);
  return s;
};
export const createCourseSection = async (data) => {
  const result = await repo.sectionCreate(data);
  await cache.invalidatePattern('sections:*');
  return result;
};
export const updateCourseSection = async (id, data) => {
  await getCourseSectionById(id);
  const result = await repo.sectionUpdate(id, data);
  await cache.invalidatePattern('sections:*');
  return result;
};
export const archiveCourseSection = async (id) => {
  await getCourseSectionById(id);
  const result = await repo.sectionArchive(id);
  await cache.invalidatePattern('sections:*');
  return result;
};
export const deleteCourseSection = async (id) => {
  await getCourseSectionById(id);
  const count = await repo.sectionHasEnrollments(id);
  if (count > 0) throw new AppError('Bu şubede aktif kayıtlar var, silinemez.', 409, null, 'HAS_DEPENDENTS');
  const result = await repo.sectionDelete(id);
  await cache.invalidatePattern('sections:*');
  return result;
};
