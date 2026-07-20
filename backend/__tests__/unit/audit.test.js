import { jest } from '@jest/globals';

process.env.AUDIT_ENABLED = 'true';

jest.unstable_mockModule('../../src/config/prisma.js', async () => {
  const { default: mockPrisma } = await import('../../__mocks__/prisma.js');
  return { default: mockPrisma };
});

jest.unstable_mockModule('../../src/utils/cache.js', async () => {
  const { mockCache } = await import('../../__mocks__/cache.js');
  return { cache: mockCache };
});

const mockPrisma = (await import('../../src/config/prisma.js')).default;
const { auditLog } = await import('../../src/utils/audit.js');

describe('auditLog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('audit log olusturur', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await auditLog({
      userId: 'user-1',
      action: 'CREATE',
      entity: 'enrollment',
      entityId: 'enr-1',
      method: 'POST',
      path: '/api/v1/enrollments',
      ipAddress: '127.0.0.1',
      statusCode: 201,
      durationMs: 150,
    });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        action: 'CREATE',
        entity: 'enrollment',
        entityId: 'enr-1',
      }),
    });
  });

  it('hata durumunda crash yapmaz', async () => {
    mockPrisma.auditLog.create.mockRejectedValue(new Error('DB error'));

    await expect(auditLog({
      userId: 'user-1',
      action: 'DELETE',
      entity: 'course',
      method: 'DELETE',
      path: '/api/v1/courses/123',
    })).resolves.toBeUndefined();
  });
});
