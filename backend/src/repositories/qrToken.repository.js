import prisma from '../config/prisma.js';

export const qrTokenCreate = (data) =>
  prisma.qRToken.create({ data, include: { courseSection: { include: { course: true } } } });

export const qrTokenFindByToken = (token) =>
  prisma.qRToken.findUnique({ where: { token }, include: { courseSection: true } });

export const qrTokenDeactivate = (id) => prisma.qRToken.update({ where: { id }, data: { isActive: false } });

export const qrTokenFindActive = (courseSectionId) =>
  prisma.qRToken.findFirst({ where: { courseSectionId, isActive: true, expiresAt: { gt: new Date() } } });

export const qrTokenFindBySection = (courseSectionId) =>
  prisma.qRToken.findMany({
    where: { courseSectionId },
    orderBy: { createdAt: 'desc' },
    include: { scans: { include: { student: true } } },
  });

export const qrScanCreate = (data) => prisma.qRScan.create({ data });

export const qrScanExists = (tokenId, studentId) =>
  prisma.qRScan.findUnique({ where: { tokenId_studentId: { tokenId, studentId } } });

export const qrTokenGetRecentScans = (courseSectionId) =>
  prisma.qRScan.findMany({
    where: { token: { courseSectionId } },
    orderBy: { scannedAt: 'desc' },
    include: { student: true, token: true },
    take: 50,
  });
