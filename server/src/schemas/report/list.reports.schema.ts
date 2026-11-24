import { z } from 'zod';

export const listReportsSchema = z.object({
  query: z.object({
    deploymentId: z.uuid().optional(),
    status: z.enum(['PENDING', 'REVIEWED', 'REVISION_REQUESTED', 'APPROVED']).optional(),
  }),
});
