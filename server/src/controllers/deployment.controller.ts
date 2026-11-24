import type { Request, Response } from 'express';
import type { DeploymentStatus } from '@/generated/prisma/client';
import { acceptDeploymentService, cancelDeploymentService, completeDeploymentService, createDeploymentService, getDeploymentService, listDeploymentsService } from '@/services/deployment';

class DeploymentController {
  public listDeployments = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const status = req.query.status as DeploymentStatus | undefined;
    const response = await listDeploymentsService.execute(req.user.userId, req.user.role, status);
    return res.status(response.code).json(response);
  };

  public createDeployment = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createDeploymentService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getDeployment = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getDeploymentService.execute(req.user.userId, req.user.role, req.params.deploymentId as string);
    return res.status(response.code).json(response);
  };

  public acceptDeployment = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await acceptDeploymentService.execute(req.user.userId, req.params.deploymentId as string);
    return res.status(response.code).json(response);
  };

  public completeDeployment = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await completeDeploymentService.execute(req.user.userId, req.params.deploymentId as string);
    return res.status(response.code).json(response);
  };

  public cancelDeployment = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await cancelDeploymentService.execute(req.user.userId, req.params.deploymentId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const deploymentController = new DeploymentController();
export default deploymentController;
