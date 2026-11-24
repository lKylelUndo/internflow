import { z } from 'zod';

export const updateOjtRequirementSchema = z.object({
  body: z
    .object({
      requiredHours: z.number().int().min(1).max(2000).optional(),
      requiredDocuments: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
      programId: z.uuid().nullable().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
