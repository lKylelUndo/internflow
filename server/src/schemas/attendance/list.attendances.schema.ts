import { z } from 'zod';

export const listAttendancesSchema = z.object({
  query: z.object({
    deploymentId: z.uuid().optional(),
    status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT']).optional(),
  }),
});
