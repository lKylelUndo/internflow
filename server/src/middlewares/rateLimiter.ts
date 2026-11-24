import rateLimit from 'express-rate-limit';

// Global abuse backstop — applied in app.ts before body parsing and all routers.
export const globalRateLimiter = rateLimit({
  limit: 300,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

// Credential endpoints — stricter than the global backstop.
export const loginRateLimiter = rateLimit({
  limit: 10,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many login attempts. Please try again later.',
  },
});

export const signupRateLimiter = rateLimit({
  limit: 20,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many signup attempts. Please try again later.',
  },
});
