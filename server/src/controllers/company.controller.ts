import type { Request, Response } from 'express';
import { createCompanyService, getCompanyService, listCompaniesService, listPublicCompaniesService, updateCompanyService } from '@/services/company';

class CompanyController {
  public listPublicCompanies = async (req: Request, res: Response) => {
    const response = await listPublicCompaniesService.execute(req.query.departmentId as string);
    return res.status(response.code).json(response);
  };

  public listCompanies = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await listCompaniesService.execute(req.user.userId);
    return res.status(response.code).json(response);
  };

  public createCompany = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createCompanyService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getCompany = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getCompanyService.execute(req.user.userId, req.params.companyId as string);
    return res.status(response.code).json(response);
  };

  public updateCompany = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateCompanyService.execute(req.user.userId, req.params.companyId as string, req.body);
    return res.status(response.code).json(response);
  };
}

export const companyController = new CompanyController();
export default companyController;
