import { z } from 'zod';

// The refresh token is transported primarily via an httpOnly cookie; an empty
// body (or a body without a token) is therefore valid.
export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});
