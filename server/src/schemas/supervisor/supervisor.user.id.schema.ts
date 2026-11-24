import { z } from 'zod';

export const supervisorUserIdSchema = z.object({
  params: z.object({
    userId: z.uuid(),
  }),
});
