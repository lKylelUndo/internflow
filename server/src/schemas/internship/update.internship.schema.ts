import { z } from 'zod';

export const updateInternshipSchema = z.object({
  body: z
    .object({
      title: z.string().min(3).max(150).optional(),
      description: z.string().min(10).max(5000).optional(),
      slots: z.number().int().min(1).max(100).optional(),
      isOpen: z.boolean().optional(),
      deadline: z.coerce.date().nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
