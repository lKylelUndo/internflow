import { z } from 'zod';

export const createEvaluationSchema = z.object({
  body: z.object({
    deploymentId: z.uuid(),
    workPerformance: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    professionalism: z.number().int().min(1).max(5),
    teamwork: z.number().int().min(1).max(5),
    punctuality: z.number().int().min(1).max(5),
    strengths: z.string().max(1000).optional(),
    improvements: z.string().max(1000).optional(),
    comments: z.string().max(1000).optional(),
  }),
});
