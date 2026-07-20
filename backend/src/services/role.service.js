import * as repo from '../repositories/role.repository.js';
import { AppError } from '../utils/appError.util.js';
import { cache } from '../utils/cache.js';

export const getRoles = async () => {
  const cached = await cache.get('roles:all');
  if (cached) return cached;
  const data = await repo.roleFindMany();
  await cache.set('roles:all', data, 86400);
  return data;
};

export const updateRole = async (id, data) => {
  const role = await repo.roleFindById(id);
  if (!role) throw new AppError('Rol bulunamadı', 404);
  const result = await repo.roleUpdate(id, { description: data.description });
  await cache.del('roles:all');
  return result;
};
