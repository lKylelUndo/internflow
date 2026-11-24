import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    internshipId: z.uuid(),
    coverLetter: z.string().max(2000).optional(),
  }),
});
