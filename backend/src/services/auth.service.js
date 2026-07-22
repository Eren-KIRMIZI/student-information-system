import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyResetToken,
  hashToken,
} from '../utils/token.util.js';
import { AppError } from '../utils/appError.util.js';
import { logEvent } from '../utils/logger.js';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

/**
 * Kullanıcı bilgilerini sanitize eder (şifre vb. hassas alanlar çıkarılır).
 */
const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role.name,
  isActive: user.isActive,
  profile: user.student ?? user.lecturer ?? null,
});

export const login = async (email, password, ipAddress = null) => {
  const user = await userRepository.findByEmailWithRole(email);

  // Enumeration koruması: her durumda aynı mesaj
  if (!user || !(await bcrypt.compare(password, user.password))) {
    await logEvent({ userId: user?.id, action: 'LOGIN_FAILED', entity: 'User', ipAddress, metadata: { email } });
    throw new AppError('E-posta veya şifre hatalı', 401);
  }
  if (!user.isActive) {
    throw new AppError('Hesabınız pasif durumda, yöneticinizle iletişime geçin', 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  await userRepository.updateLastLogin(user.id);
  await logEvent({ userId: user.id, action: 'LOGIN_SUCCESS', entity: 'User', ipAddress });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

export const refresh = async (incomingToken, ipAddress = null) => {
  let payload;
  try {
    payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Refresh token geçersiz veya süresi dolmuş', 401);
  }

  const stored = await refreshTokenRepository.findValidByHash(hashToken(incomingToken));

  if (!stored) {
    // Aynı token iki kez kullanılmaya çalışıldı → şüpheli aktivite
    await logEvent({ userId: payload.sub, action: 'SUSPICIOUS_REFRESH_ATTEMPT', entity: 'RefreshToken', ipAddress });
    throw new AppError('Refresh token geçersiz veya iptal edilmiş', 401);
  }

  if (stored.userId !== payload.sub) {
    throw new AppError('Refresh token geçersiz veya iptal edilmiş', 401);
  }

  await refreshTokenRepository.revoke(stored.id);

  const user = await userRepository.findByIdWithRole(payload.sub);
  if (!user || !user.isActive) throw new AppError('Hesap bulunamadı veya pasif', 401);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (incomingToken) => {
  if (!incomingToken) return;
  const stored = await refreshTokenRepository.findValidByHash(hashToken(incomingToken));
  if (stored) await refreshTokenRepository.revoke(stored.id);
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmailWithRole(email);

  // Her durumda aynı mesaj (enumeration koruması)
  if (!user || !user.isActive) return null;

  const resetToken = generateResetToken(user.id);

  // Geliştirme: console'a logla; prod'da e-posta gönderilecek
  const resetLink = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  console.log(`\n🔗 [DEV] Şifre Sıfırlama Linki:\n   ${resetLink}\n`);

  await logEvent({ userId: user.id, action: 'PASSWORD_RESET_REQUESTED', entity: 'User' });

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    throw new AppError('Şifre sıfırlama tokeni geçersiz veya süresi dolmuş', 401);
  }

  if (payload.purpose !== 'reset') {
    throw new AppError('Geçersiz token tipi', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await userRepository.updatePassword(payload.sub, hashedPassword);
  await refreshTokenRepository.revokeAllByUserId(payload.sub);

  await logEvent({ userId: payload.sub, action: 'PASSWORD_RESET_SUCCESS', entity: 'User' });
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findByEmailWithRole((await userRepository.findById(userId))?.email);

  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError('Mevcut şifre hatalı', 401);

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await userRepository.updatePassword(userId, hashedPassword);
  await refreshTokenRepository.revokeAllByUserId(userId);

  // Mevcut oturum için yeni token çifti üret
  const freshUser = await userRepository.findByIdWithRole(userId);
  const newAccessToken = generateAccessToken(freshUser);
  const newRefreshToken = generateRefreshToken(freshUser);

  await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await logEvent({ userId, action: 'PASSWORD_CHANGED', entity: 'User' });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
