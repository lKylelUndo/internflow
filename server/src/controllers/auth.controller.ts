import type { Request, Response } from 'express';
import { ENV } from '@/config/env';
import { authLoginService, deanSignupService, getMeService, logoutService, refreshTokenService, studentSignupService, supervisorSignupService } from '@/services/auth';
import type { AuthTokens } from '@/types/auth';
import type { ServiceResponse } from '@/types/api';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_PATH = '/api/auth/v1';

class AuthController {
  private setAuthCookies = (res: Response, tokens: AuthTokens): void => {
    const secure = ENV.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: REFRESH_TOKEN_PATH,
    });
  };

  private clearAuthCookies = (res: Response): void => {
    const secure = ENV.NODE_ENV === 'production';

    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'lax', secure, path: '/' });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: REFRESH_TOKEN_PATH,
    });
  };

  private respond = <T extends object>(res: Response, response: ServiceResponse<T>): Response => {
    if (!response.data) {
      return res.status(response.code).json(response);
    }

    // Tokens travel exclusively through httpOnly cookies — never in the JSON body.
    const { tokens, ...data } = response.data as T & { tokens?: AuthTokens };
    if (tokens) {
      this.setAuthCookies(res, tokens);
    }

    return res.status(response.code).json({ ...response, data });
  };

  public signupStudent = async (req: Request, res: Response) => {
    const response = await studentSignupService.execute(req.body);
    return this.respond(res, response);
  };

  public signupDean = async (req: Request, res: Response) => {
    const response = await deanSignupService.execute(req.body);
    return this.respond(res, response);
  };

  public signupSupervisor = async (req: Request, res: Response) => {
    const response = await supervisorSignupService.execute(req.body);
    return this.respond(res, response);
  };

  public login = async (req: Request, res: Response) => {
    const response = await authLoginService.execute(req.body);
    return this.respond(res, response);
  };

  public refreshToken = async (req: Request, res: Response) => {
    const cookies = req.cookies as Record<string, string | undefined>;
    const body = (req.body ?? {}) as { refreshToken?: string };
    const response = await refreshTokenService.execute(cookies.refreshToken ?? body.refreshToken);
    return this.respond(res, response);
  };

  public logout = async (req: Request, res: Response) => {
    const cookies = req.cookies as Record<string, string | undefined>;
    const response = await logoutService.execute(cookies.refreshToken);
    this.clearAuthCookies(res);
    return res.status(response.code).json(response);
  };

  public getMe = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', code: 401, message: 'Authentication required' });
    }

    const response = await getMeService.execute(req.user.userId);
    return this.respond(res, response);
  };
}

export const authController = new AuthController();
export default authController;
