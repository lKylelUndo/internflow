import { z } from 'zod';

export const createAttendanceSchema = z.object({
  body: z.object({
    deploymentId: z.uuid(),
    date: z.coerce.date(),
    timeIn: z.coerce.date().optional(),
    timeOut: z.coerce.date().optional(),
    status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT']).optional(),
    remarks: z.string().max(500).optional(),
  }),
});
