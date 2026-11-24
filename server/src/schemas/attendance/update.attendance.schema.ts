import { z } from 'zod';

export const updateAttendanceSchema = z.object({
  body: z
    .object({
      timeIn: z.coerce.date().nullable().optional(),
      timeOut: z.coerce.date().nullable().optional(),
      status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT']).optional(),
      remarks: z.string().max(500).nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
