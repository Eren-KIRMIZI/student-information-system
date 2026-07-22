import prisma from '../config/prisma.js';

export const logFindMany = (where, skip, take) =>
  prisma.log.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, role: true } } },
  });

export const logCount = (where) => prisma.log.count({ where });

export const auditLogFindMany = (where, skip, take) =>
  prisma.auditLog.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    // Notice: AuditLog table may not have relation to User in schema depending on how userId is defined. Let me check the schema first. Wait!
  });

export const auditLogCount = (where) => prisma.auditLog.count({ where });
