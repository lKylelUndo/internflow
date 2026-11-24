import { z } from 'zod';

export const cancelDeploymentSchema = z.object({
  body: z.object({
    cancelledReason: z.string().min(3).max(500),
  }),
});
