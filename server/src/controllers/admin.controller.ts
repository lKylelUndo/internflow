import type { Request, Response } from 'express';
import type { AccountStatus } from '@/generated/prisma/client';
import { listDeansService, suspendDeanService, verifyDeanService } from '@/services/admin';

class AdminController {
  public listDeans = async (req: Request, res: Response) => {
    const status = req.query.status as AccountStatus | undefined;
    const response = await listDeansService.execute(status);
    return res.status(response.code).json(response);
  };

  public verifyDean = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await verifyDeanService.execute(req.params.userId as string, req.user.userId);
    return res.status(response.code).json(response);
  };

  public suspendDean = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await suspendDeanService.execute(req.params.userId as string, req.user.userId);
    return res.status(response.code).json(response);
  };
}

export const adminController = new AdminController();
export default adminController;
