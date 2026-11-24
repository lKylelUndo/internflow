import { z } from 'zod';

export const createDeploymentSchema = z.object({
  body: z.object({
    applicationId: z.uuid(),
    supervisorId: z.uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  }),
});
