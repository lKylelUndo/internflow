import { z } from 'zod';

export const attendanceIdSchema = z.object({
  params: z.object({
    attendanceId: z.uuid(),
  }),
});
