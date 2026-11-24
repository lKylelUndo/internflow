import { EvaluationStatus } from '@/generated/prisma/client';
import { findEvaluationById, updateEvaluation } from '@/repositories/evaluation.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { EvaluationData, UpdateEvaluationInput, UpdateEvaluationRecord } from '@/types/evaluation';
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

export const updateEvaluationService = {
  execute: async (
    supervisorUserId: string,
    evaluationId: string,
    input: UpdateEvaluationInput,
  ): Promise<ServiceResponse<EvaluationData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const evaluation = await findEvaluationById(evaluationId);
      if (!evaluation || evaluation.deployment.supervisorId !== profile.id) {
        return { status: 'error', code: 404, message: 'Evaluation not found' };
      }
      if (evaluation.status !== EvaluationStatus.SUBMITTED) {
        return { status: 'error', code: 409, message: 'Reviewed evaluation cannot be modified' };
      }

      const scores = {
        workPerformance: input.workPerformance ?? evaluation.workPerformance ?? 0,
        communication: input.communication ?? evaluation.communication ?? 0,
        professionalism: input.professionalism ?? evaluation.professionalism ?? 0,
        teamwork: input.teamwork ?? evaluation.teamwork ?? 0,
        punctuality: input.punctuality ?? evaluation.punctuality ?? 0,
      };

      const record: UpdateEvaluationRecord = {
        overallRating: computeOverall(scores),
        ...(input.workPerformance !== undefined && { workPerformance: input.workPerformance }),
        ...(input.communication !== undefined && { communication: input.communication }),
        ...(input.professionalism !== undefined && { professionalism: input.professionalism }),
        ...(input.teamwork !== undefined && { teamwork: input.teamwork }),
        ...(input.punctuality !== undefined && { punctuality: input.punctuality }),
        ...(input.strengths !== undefined && { strengths: input.strengths }),
        ...(input.improvements !== undefined && { improvements: input.improvements }),
        ...(input.comments !== undefined && { comments: input.comments }),
      };

      const updated = await updateEvaluation(evaluationId, record);

      return {
        status: 'success',
        code: 200,
        message: 'Evaluation updated successfully',
        data: { evaluation: updated },
      };
    } catch (error) {
      console.error('updateEvaluationService', error);
      return { status: 'error', code: 500, message: 'Failed to update evaluation' };
    }
  },
};
