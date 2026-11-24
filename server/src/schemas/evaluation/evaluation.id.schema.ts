import { z } from 'zod';

export const evaluationIdSchema = z.object({
  params: z.object({
    evaluationId: z.uuid(),
  }),
});
