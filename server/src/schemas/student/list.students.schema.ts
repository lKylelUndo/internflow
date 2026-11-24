import { z } from 'zod';

export const listStudentsSchema = z.object({
  query: z.object({
    eligibilityStatus: z.enum(['PENDING', 'ELIGIBLE', 'INELIGIBLE']).optional(),
  }),
});
