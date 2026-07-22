import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Sisteme giriş yap
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Başarılı giriş — accessToken ve kullanıcı bilgisi döner
 *       401:
 *         description: E-posta veya şifre hatalı
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const { accessToken, refreshToken: token, user } = await authService.login(email, password, ipAddress);
    res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
    return successResponse(res, { accessToken, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Access token yenile (refresh token cookie ile)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Yeni access token döner
 *       401:
 *         description: Refresh token geçersiz veya bulunamadı
 */
export const refresh = async (req, res, next) => {
  try {
    const incoming = req.cookies.refreshToken;
    if (!incoming) return next(new AppError('Refresh token bulunamadı', 401));
    const ipAddress = req.ip;
    const { accessToken, refreshToken: token } = await authService.refresh(incoming, ipAddress);
    res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
    return successResponse(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Çıkış yap — refresh token iptal edilir
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Başarıyla çıkış yapıldı
 */
export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    return successResponse(res, null, 'Çıkış yapıldı');
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama linki talep et
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Sıfırlama bağlantısı gönderildi (her zaman aynı mesaj)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return successResponse(res, null, 'E-posta adresiniz sistemde kayıtlıysa sıfırlama bağlantısı gönderildi.');
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Yeni şifre belirle (reset token ile)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *       401:
 *         description: Token geçersiz
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return successResponse(res, null, 'Şifreniz başarıyla güncellendi.');
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Şifre değiştir (oturum açıkken)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Şifre değiştirildi, yeni token çifti döner
 *       401:
 *         description: Mevcut şifre hatalı
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { accessToken, refreshToken: token } = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );
    // codeql[js/clear-text-storage-of-sensitive-information]
    res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
    return successResponse(res, { accessToken }, 'Şifreniz başarıyla değiştirildi.');
  } catch (err) {
    next(err);
  }
};
