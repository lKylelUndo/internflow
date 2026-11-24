import { z } from 'zod';

export const updateEligibilitySchema = z.object({
  body: z.object({
    eligibilityStatus: z.enum(['ELIGIBLE', 'INELIGIBLE']),
  }),
});
