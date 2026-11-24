import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '@/config/env';
import type { AuthTokenPayload } from '@/types/auth';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export const signAccessToken = (payload: Omit<AuthTokenPayload, 'type'>) =>
  jwt.sign({ ...payload, type: 'access' }, ENV.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

export const signRefreshToken = (payload: Omit<AuthTokenPayload, 'type'>) =>
  jwt.sign({ ...payload, type: 'refresh' }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
    // Unique per issuance: guarantees rotation produces a new token even within
    // the same second (iat has 1s granularity).
    jwtid: randomUUID(),
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, ENV.JWT_REFRESH_SECRET) as AuthTokenPayload;
