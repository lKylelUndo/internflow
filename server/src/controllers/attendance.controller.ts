import type { Request, Response } from 'express';
import type { AttendanceStatus } from '@/generated/prisma/client';
import { createAttendanceService, getAttendanceService, listAttendancesService, updateAttendanceService, verifyAttendanceService } from '@/services/attendance';

class AttendanceController {
  public listAttendances = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const deploymentId = req.query.deploymentId as string | undefined;
    const status = req.query.status as AttendanceStatus | undefined;
    const response = await listAttendancesService.execute(req.user.userId, req.user.role, { deploymentId, status });
    return res.status(response.code).json(response);
  };

  public createAttendance = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createAttendanceService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getAttendance = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getAttendanceService.execute(req.user.userId, req.user.role, req.params.attendanceId as string);
    return res.status(response.code).json(response);
  };

  public updateAttendance = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateAttendanceService.execute(req.user.userId, req.params.attendanceId as string, req.body);
    return res.status(response.code).json(response);
  };

  public verifyAttendance = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await verifyAttendanceService.execute(req.user.userId, req.params.attendanceId as string);
    return res.status(response.code).json(response);
  };
}

export const attendanceController = new AttendanceController();
export default attendanceController;
