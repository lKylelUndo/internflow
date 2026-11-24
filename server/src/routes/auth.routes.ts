import { Router } from 'express';
import authController from '@/controllers/auth.controller';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { loginRateLimiter, signupRateLimiter } from '@/middlewares/rateLimiter';
import { validateSchema } from '@/middlewares/validate-schema';
import { deanSignupSchema, loginSchema, refreshTokenSchema, studentSignupSchema, supervisorSignupSchema } from '@/schemas/auth';

const authRoutes = Router();

// Public
authRoutes.post(
  '/signup/student',
  signupRateLimiter,
  validateSchema(studentSignupSchema),
  authController.signupStudent,
);
authRoutes.post(
  '/signup/dean',
  signupRateLimiter,
  validateSchema(deanSignupSchema),
  authController.signupDean,
);
authRoutes.post(
  '/signup/supervisor',
  signupRateLimiter,
  validateSchema(supervisorSignupSchema),
  authController.signupSupervisor,
);
authRoutes.post('/login', loginRateLimiter, validateSchema(loginSchema), authController.login);
authRoutes.post(
  '/refresh-token',
  validateSchema(refreshTokenSchema),
  authController.refreshToken,
);

// Protected
authRoutes.post('/logout', authMiddleware.execute, authController.logout);
authRoutes.get('/me', authMiddleware.execute, authController.getMe);

export default authRoutes;
