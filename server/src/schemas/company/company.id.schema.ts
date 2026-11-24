import { z } from 'zod';

export const companyIdSchema = z.object({
  params: z.object({
    companyId: z.uuid(),
  }),
});
