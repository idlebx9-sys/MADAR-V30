import type { Response, Request } from 'express';

const AUTH_COOKIE_NAME = 'madar_auth_token';
const REFRESH_COOKIE_NAME = 'madar_refresh_token';

export const setAuthCookies = (res: Response, authToken: string, refreshToken?: string) => {
  const isSecure = process.env.NODE_ENV === 'production' || true;
  res.cookie(AUTH_COOKIE_NAME, authToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'none',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    path: '/',
  });

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
};

export const getAuthTokenFromRequest = (req: Request): string | null => {
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};
