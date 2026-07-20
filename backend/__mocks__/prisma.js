import { jest } from '@jest/globals';

const mockPrisma = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  student: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  lecturer: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  enrollment: { findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), delete: jest.fn(), count: jest.fn() },
  grade: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  attendance: { findMany: jest.fn(), create: jest.fn(), upsert: jest.fn(), count: jest.fn() },
  course: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  courseSection: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  faculty: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  department: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  announcement: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  academicCalendar: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  auditLog: { create: jest.fn(), findMany: jest.fn() },
  systemSetting: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
  idempotencyRecord: { findUnique: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
  log: { create: jest.fn(), findMany: jest.fn() },
};

export default mockPrisma;
