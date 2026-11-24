import type { Request, Response } from 'express';
import type { ApplicationStatus } from '@/generated/prisma/client';
import { createApplicationService, getApplicationService, listApplicationsService, reviewApplicationService, withdrawApplicationService } from '@/services/application';

class ApplicationController {
  public listApplications = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const status = req.query.status as ApplicationStatus | undefined;
    const response = await listApplicationsService.execute(req.user.userId, req.user.role, status);
    return res.status(response.code).json(response);
  };

  public createApplication = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createApplicationService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getApplication = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getApplicationService.execute(req.user.userId, req.user.role, req.params.applicationId as string);
    return res.status(response.code).json(response);
  };

  public reviewApplication = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await reviewApplicationService.execute(req.user.userId, req.params.applicationId as string, req.body);
    return res.status(response.code).json(response);
  };

  public withdrawApplication = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await withdrawApplicationService.execute(req.user.userId, req.params.applicationId as string);
    return res.status(response.code).json(response);
  };
}

export const applicationController = new ApplicationController();
export default applicationController;
