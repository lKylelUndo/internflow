import { z } from 'zod';

export const reportIdSchema = z.object({
  params: z.object({
    reportId: z.uuid(),
  }),
});
