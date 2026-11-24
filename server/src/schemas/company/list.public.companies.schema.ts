import { z } from 'zod';

export const listPublicCompaniesSchema = z.object({
  query: z.object({
    departmentId: z.uuid(),
  }),
});
