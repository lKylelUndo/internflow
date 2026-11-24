import { z } from 'zod';

export const createOjtRequirementSchema = z.object({
  body: z.object({
    requiredHours: z.number().int().min(1).max(2000),
    requiredDocuments: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
    programId: z.uuid().optional(),
    isActive: z.boolean().optional(),
  }),
});
