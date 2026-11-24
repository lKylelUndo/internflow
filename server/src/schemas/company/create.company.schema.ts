import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    address: z.string().min(5).max(255),
    contactEmail: z.email().max(255).optional(),
    contactNumber: z.string().max(30).optional(),
    website: z.url().optional(),
    description: z.string().max(2000).optional(),
    logoUrl: z.url().optional(),
  }),
});
