import { z } from 'zod';

export const updateCompanySchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(150).optional(),
      address: z.string().min(5).max(255).optional(),
      contactEmail: z.email().max(255).optional(),
      contactNumber: z.string().max(30).optional(),
      website: z.url().optional(),
      description: z.string().max(2000).optional(),
      logoUrl: z.url().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
