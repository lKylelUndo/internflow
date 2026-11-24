import { z } from 'zod';

export const listDeploymentsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING_ACCEPTANCE', 'DEPLOYED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});
