import type { Request, Response } from 'express';
import { createOjtRequirementService, getOjtRequirementService, listOjtRequirementsService, updateOjtRequirementService } from '@/services/ojt-requirement';

class OjtRequirementController {
  public listRequirements = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await listOjtRequirementsService.execute(req.user.userId);
    return res.status(response.code).json(response);
  };

  public createRequirement = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createOjtRequirementService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getRequirement = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getOjtRequirementService.execute(req.user.userId, req.params.requirementId as string);
    return res.status(response.code).json(response);
  };

  public updateRequirement = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateOjtRequirementService.execute(req.user.userId, req.params.requirementId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const ojtRequirementController = new OjtRequirementController();
export default ojtRequirementController;
