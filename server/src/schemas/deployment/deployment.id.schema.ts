import { z } from 'zod';

export const deploymentIdSchema = z.object({
  params: z.object({
    deploymentId: z.uuid(),
  }),
});
