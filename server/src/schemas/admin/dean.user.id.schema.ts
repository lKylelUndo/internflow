import { z } from 'zod';

export const deanUserIdSchema = z.object({
  params: z.object({
    userId: z.uuid(),
  }),
});
