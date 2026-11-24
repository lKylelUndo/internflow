import { z } from 'zod';

export const createInternshipSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(5000),
    slots: z.number().int().min(1).max(100).optional(),
    deadline: z.coerce.date().optional(),
  }),
});
