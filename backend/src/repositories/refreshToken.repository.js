import prisma from '../config/prisma.js';

export const create = ({ userId, tokenHash, expiresAt }) =>
  prisma.refreshToken.create({
    data: { userId, token: tokenHash, expiresAt },
  });

export const findValidByHash = (tokenHash) =>
  prisma.refreshToken.findFirst({
    where: {
      token: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

export const revoke = (id) =>
  prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

export const revokeAllByUserId = (userId) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
