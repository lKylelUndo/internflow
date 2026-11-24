import { z } from 'zod';

export const ojtRequirementIdSchema = z.object({
  params: z.object({
    requirementId: z.uuid(),
  }),
});
