import type { Request, Response } from 'express';
import type { EvaluationStatus } from '@/generated/prisma/client';
import { createEvaluationService, getEvaluationService, listEvaluationsService, reviewEvaluationService, updateEvaluationService } from '@/services/evaluation';

class EvaluationController {
  public listEvaluations = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const deploymentId = req.query.deploymentId as string | undefined;
    const status = req.query.status as EvaluationStatus | undefined;
    const response = await listEvaluationsService.execute(req.user.userId, req.user.role, { deploymentId, status });
    return res.status(response.code).json(response);
  };

  public createEvaluation = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await createEvaluationService.execute(req.user.userId, req.body);
    return res.status(response.code).json(response);
  };

  public getEvaluation = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getEvaluationService.execute(req.user.userId, req.user.role, req.params.evaluationId as string);
    return res.status(response.code).json(response);
  };

  public updateEvaluation = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await updateEvaluationService.execute(req.user.userId, req.params.evaluationId as string, req.body);
    return res.status(response.code).json(response);
  };

  public reviewEvaluation = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await reviewEvaluationService.execute(req.user.userId, req.params.evaluationId as string);
    return res.status(response.code).json(response);
  };
}

export const evaluationController = new EvaluationController();
export default evaluationController;
