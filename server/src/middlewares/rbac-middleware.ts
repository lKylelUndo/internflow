import type { Request, Response, NextFunction } from 'express';
import type { RoleType } from '@/generated/prisma/client';

export const permittedRole =
  (roles: RoleType[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'You are not allowed to access this resource',
      });
    }

    return next();
  };
