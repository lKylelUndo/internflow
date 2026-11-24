import { z } from 'zod';

export const applicationIdSchema = z.object({
  params: z.object({
    applicationId: z.uuid(),
  }),
});
