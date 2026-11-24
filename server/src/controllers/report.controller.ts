import type { Request, Response } from 'express';
import type { ReportStatus } from '@/generated/prisma/client';
import { createReportService, getReportService, listReportsService, reviewReportService, updateReportService } from '@/services/report';

class ReportController {
  public listReports = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const deploymentId = req.query.deploymentId as string | undefined;
    const status = req.query.status as ReportStatus | undefined;
    const response = await listReportsService.execute(req.user.userId, req.user.role, { deploymentId, status });
    return res.status(response.code).json(response);
  };

  public createReport = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createReportService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getReport = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getReportService.execute(req.user.userId, req.user.role, req.params.reportId as string);
    return res.status(response.code).json(response);
  };

  public updateReport = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateReportService.execute(req.user.userId, req.params.reportId as string, req.body);
    return res.status(response.code).json(response);
  };

  public reviewReport = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await reviewReportService.execute(req.user.userId, req.params.reportId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const reportController = new ReportController();
export default reportController;
