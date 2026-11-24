import { z } from 'zod';

export const listInternshipsSchema = z.object({
  query: z.object({
    isOpen: z.enum(['true', 'false']).optional(),
  }),
});
