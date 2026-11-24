import type { Request, Response } from 'express';
import { getDepartmentsService } from '@/services/academic';

class AcademicController {
  public getDepartments = async (_req: Request, res: Response) => {
    const response = await getDepartmentsService.execute();
    return res.status(response.code).json(response);
  };
}

export const academicController = new AcademicController();
export default academicController;
