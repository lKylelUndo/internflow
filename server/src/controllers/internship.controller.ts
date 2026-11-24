import type { Request, Response } from 'express';
import { createInternshipService, getInternshipService, listInternshipsService, updateInternshipService } from '@/services/internship';

class InternshipController {
  public listInternships = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const isOpen = req.query.isOpen === undefined ? undefined : req.query.isOpen === 'true';
    const response = await listInternshipsService.execute(req.user.userId, req.user.role, isOpen);
    return res.status(response.code).json(response);
  };

  public createInternship = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createInternshipService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getInternship = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getInternshipService.execute(req.user.userId, req.user.role, req.params.internshipId as string);
    return res.status(response.code).json(response);
  };

  public updateInternship = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateInternshipService.execute(req.user.userId, req.params.internshipId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const internshipController = new InternshipController();
export default internshipController;
