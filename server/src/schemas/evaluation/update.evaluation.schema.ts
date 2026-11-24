import { z } from 'zod';

export const updateEvaluationSchema = z.object({
  body: z
    .object({
      workPerformance: z.number().int().min(1).max(5).optional(),
      communication: z.number().int().min(1).max(5).optional(),
      professionalism: z.number().int().min(1).max(5).optional(),
      teamwork: z.number().int().min(1).max(5).optional(),
      punctuality: z.number().int().min(1).max(5).optional(),
      strengths: z.string().max(1000).optional(),
      improvements: z.string().max(1000).optional(),
      comments: z.string().max(1000).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
});
