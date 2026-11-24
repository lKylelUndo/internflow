import { z } from 'zod';

export const listSupervisorsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED']).optional(),
  }),
});
