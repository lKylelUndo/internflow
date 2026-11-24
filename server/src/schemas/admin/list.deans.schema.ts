import { z } from 'zod';

export const listDeansSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED']).optional(),
  }),
});
