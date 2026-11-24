import { z } from 'zod';

export const internshipIdSchema = z.object({
  params: z.object({
    internshipId: z.uuid(),
  }),
});
