import { DeploymentStatus, EvaluationStatus, Prisma } from '@/generated/prisma/client';
import { findDeploymentById } from '@/repositories/deployment.repository';
import { createEvaluation, findEvaluationByDeploymentId } from '@/repositories/evaluation.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { CreateEvaluationInput, EvaluationData } from '@/types/evaluation';
import type { ServiceResponse } from '@/types/api';

const computeOverall = (scores: {
  workPerformance: number;
  communication: number;
  professionalism: number;
  teamwork: number;
  punctuality: number;
}): number =>
  Math.round(
    ((scores.workPerformance + scores.communication + scores.professionalism + scores.teamwork + scores.punctuality) / 5) * 100,
  ) / 100;

export const createEvaluationService = {
  execute: async (supervisorUserId: string, input: CreateEvaluationInput): Promise<ServiceResponse<EvaluationData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const deployment = await findDeploymentById(input.deploymentId);
      if (!deployment || deployment.supervisorId !== profile.id) {
        return { status: 'error', code: 404, message: 'Deployment not found' };
      }
      if (
        deployment.status !== DeploymentStatus.DEPLOYED &&
        deployment.status !== DeploymentStatus.IN_PROGRESS &&
        deployment.status !== DeploymentStatus.COMPLETED
      ) {
        return { status: 'error', code: 400, message: 'Deployment is not eligible for evaluation' };
      }

      const existing = await findEvaluationByDeploymentId(input.deploymentId);
      if (existing) {
        return { status: 'error', code: 409, message: 'An evaluation already exists for this deployment' };
      }

      const evaluation = await createEvaluation({
        deploymentId: input.deploymentId,
        supervisorId: profile.id,
        status: EvaluationStatus.SUBMITTED,
        workPerformance: input.workPerformance,
        communication: input.communication,
        professionalism: input.professionalism,
        teamwork: input.teamwork,
        punctuality: input.punctuality,
        overallRating: computeOverall(input),
        ...(input.strengths !== undefined && { strengths: input.strengths }),
        ...(input.improvements !== undefined && { improvements: input.improvements }),
        ...(input.comments !== undefined && { comments: input.comments }),
        submittedAt: new Date(),
      });

      return {
        status: 'success',
        code: 201,
        message: 'Evaluation submitted successfully',
        data: { evaluation },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'An evaluation already exists for this deployment' };
      }

      console.error('createEvaluationService', error);
      return { status: 'error', code: 500, message: 'Failed to submit evaluation' };
    }
  },
};
