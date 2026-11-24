import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    deploymentId: z.uuid(),
    weekStart: z.coerce.date(),
    weekEnd: z.coerce.date(),
    activities: z.string().min(10).max(5000),
  }),
});
