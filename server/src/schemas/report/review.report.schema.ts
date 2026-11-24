import { z } from 'zod';

export const reviewReportSchema = z.object({
  body: z
    .object({
      status: z.enum(['REVIEWED', 'REVISION_REQUESTED', 'APPROVED']),
      feedback: z.string().min(3).max(1000).optional(),
    })
    .refine((body) => body.status !== 'REVISION_REQUESTED' || body.feedback !== undefined, {
      message: 'Feedback is required when requesting a revision',
    }),
});
