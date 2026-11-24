import type { Request, Response } from 'express';
import type { AccountStatus } from '@/generated/prisma/client';
import { listSupervisorsService, suspendSupervisorService, verifySupervisorService } from '@/services/supervisor';

class SupervisorController {
  public listSupervisors = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const status = req.query.status as AccountStatus | undefined;
    const response = await listSupervisorsService.execute(req.user.userId, status);
    return res.status(response.code).json(response);
  };

  public verifySupervisor = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await verifySupervisorService.execute(req.params.userId as string, req.user.userId);
    return res.status(response.code).json(response);
  };

  public suspendSupervisor = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await suspendSupervisorService.execute(req.params.userId as string, req.user.userId);
    return res.status(response.code).json(response);
  };
}

export const supervisorController = new SupervisorController();
export default supervisorController;
