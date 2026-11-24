import { z } from 'zod';

export const updateReportSchema = z.object({
  body: z
    .object({
      weekStart: z.coerce.date().optional(),
      weekEnd: z.coerce.date().optional(),
      activities: z.string().min(10).max(5000).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
