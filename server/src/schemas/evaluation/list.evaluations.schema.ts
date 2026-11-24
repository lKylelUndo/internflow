import { z } from 'zod';

export const listEvaluationsSchema = z.object({
  query: z.object({
    deploymentId: z.uuid().optional(),
    status: z.enum(['PENDING', 'SUBMITTED', 'REVIEWED']).optional(),
  }),
});
