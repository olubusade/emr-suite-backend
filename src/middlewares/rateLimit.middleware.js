import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter (15 minutes window, 100 requests per IP)
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Account creation limiter (1 hour window, 5 accounts per IP)
 */
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 create account requests per windowMs
  message: {
    statusCode: 429,
    error: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login attempts limiter (10 minutes window, 5 attempts per IP)
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    statusCode: 429,
    error: 'Too many login attempts, please try again later.'
  },
});
