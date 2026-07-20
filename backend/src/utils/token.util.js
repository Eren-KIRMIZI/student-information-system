import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Access token üretir (kısa ömürlü, rol taşır).
 */
export const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
  );

/**
 * Refresh token üretir (uzun ömürlü, rol taşımaz).
 * jti eklenerek aynı saniyede üretilen tokenların farklı olması sağlanır.
 */
export const generateRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
  );

/**
 * Reset token üretir (çok kısa ömürlü, amaç belirtilir).
 */
export const generateResetToken = (userId) =>
  jwt.sign(
    { sub: userId, purpose: 'reset', jti: crypto.randomUUID() },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '15m' }
  );

/**
 * Reset token'ı doğrular.
 */
export const verifyResetToken = (token) =>
  jwt.verify(token, process.env.JWT_RESET_SECRET);

/**
 * Token'ı SHA-256 ile hash'ler (DB'de ham token saklanmaz).
 */
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
