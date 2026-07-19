import * as repo from '../repositories/role.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getRoles = async () => {
  return repo.roleFindMany();
};

export const updateRole = async (id, data) => {
  const role = await repo.roleFindById(id);
  if (!role) throw new AppError('Rol bulunamadı', 404);
  return repo.roleUpdate(id, { description: data.description });
};
