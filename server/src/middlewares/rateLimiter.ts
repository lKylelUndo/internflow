import rateLimit from 'express-rate-limit';

// Global abuse backstop — applied in app.ts before body parsing and all routers.
export const globalRateLimiter = rateLimit({
  limit: 100,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});
