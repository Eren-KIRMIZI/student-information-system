/**
 * Global hata yakalayıcı — server.js'de en son middleware olarak bağlanır.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Sunucu hatası oluştu';

  if (!err.isOperational) {
    console.error('[ERROR]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code: err.code || null,
    errors: err.errors || null,
  });
};
