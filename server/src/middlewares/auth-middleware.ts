import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/lib/jwt';

class AuthMiddleware {
  public execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
      const token = bearerToken ?? req.cookies?.accessToken;

      if (!token) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Authentication required',
        });
      }

      const payload = verifyAccessToken(token);

      if (payload.type !== 'access') {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Invalid session token',
        });
      }

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'access',
      };
      return next();
    } catch {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Invalid or expired session',
      });
    }
  };
}

export const authMiddleware = new AuthMiddleware();
export default authMiddleware;
