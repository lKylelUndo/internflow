import { z } from 'zod';

export const studentSignupSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100),
    middleName: z.string().max(100).optional(),
    lastName: z.string().min(2).max(100),
    email: z.email().max(255),
    password: z.string().min(8).max(72),
    contactNumber: z.string().max(20).optional(),
    studentNumber: z.string().min(1).max(50),
    yearLevel: z.number().int().min(1).max(6),
    programId: z.uuid(),
  }),
});
