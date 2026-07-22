import prisma from '../config/prisma.js';

/**
 * Kritik olayları logs tablosuna yazar.
 * @param {{ userId?: string, action: string, entity?: string, entityId?: string, ipAddress?: string, metadata?: object }} params
 */
export const logEvent = async ({
  userId = null,
  action,
  entity = null,
  entityId = null,
  ipAddress = null,
  metadata = null,
}) => {
  try {
    await prisma.log.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ipAddress,
        metadata,
      },
    });
  } catch (err) {
    // Loglama hatası asla ana akışı bozmaz
    console.error('[Logger] Log kaydı başarısız:', err.message);
  }
};
