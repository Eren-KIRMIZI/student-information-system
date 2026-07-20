import { AppError } from './appError.util.js';

export const optimisticLock = {
  async update({ model, id, data, errorMessage = 'Kayit baska bir tarafindan guncellendi. Lutfen sayfayi yenileyin.' }) {
    const current = await model.findUnique({ where: { id }, select: { updatedAt: true } });
    if (!current) throw new AppError('Kayit bulunamadi', 404);

    const result = await model.updateMany({
      where: { id, updatedAt: current.updatedAt },
      data,
    });

    if (result.count === 0) {
      throw new AppError(errorMessage, 409);
    }

    return model.findUnique({ where: { id } });
  },

  checkConflict(result, errorMessage = 'Cakisma olustu. Lutfen tekrar deneyin.') {
    if (result.count === 0) {
      throw new AppError(errorMessage, 409);
    }
  },
};
