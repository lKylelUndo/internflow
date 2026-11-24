import type { Request, Response } from 'express';
import type { EligibilityStatus } from '@/generated/prisma/client';
import { getStudentService, listStudentsService, updateStudentEligibilityService } from '@/services/student';

class StudentController {
  public listStudents = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const eligibilityStatus = req.query.eligibilityStatus as EligibilityStatus | undefined;
    const response = await listStudentsService.execute(req.user.userId, eligibilityStatus);
    return res.status(response.code).json(response);
  };

  public getStudent = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getStudentService.execute(req.user.userId, req.params.userId as string);
    return res.status(response.code).json(response);
  };

  public updateEligibility = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateStudentEligibilityService.execute(req.user.userId, req.params.userId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const studentController = new StudentController();
export default studentController;
