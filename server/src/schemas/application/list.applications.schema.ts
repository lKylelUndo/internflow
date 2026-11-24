import { z } from 'zod';

export const listApplicationsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN']).optional(),
  }),
});
