import rateLimit from 'express-rate-limit';

/**
 * Login ve forgot-password endpoint'leri için rate limiter.
 * Production: 5 deneme / 15 dakika / IP başına
 * Development: 50 deneme (test kolaylığı için)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: {
    success: false,
    message: 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});
