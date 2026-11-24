import { z } from 'zod';

export const reviewApplicationSchema = z.object({
  body: z
    .object({
      status: z.enum(['APPROVED', 'REJECTED']),
      rejectionReason: z.string().min(3).max(500).optional(),
    })
    .refine((body) => body.status !== 'REJECTED' || body.rejectionReason !== undefined, {
      message: 'Rejection reason is required when rejecting',
    }),
});
