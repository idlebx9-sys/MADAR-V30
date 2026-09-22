import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { getAuthTokenFromRequest } from './cookies.ts';
import { verifySessionToken, type TokenPayload } from './auth.ts';

export interface Context {
  user: TokenPayload | null;
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  const token = getAuthTokenFromRequest(req);
  let user: TokenPayload | null = null;

  if (token) {
    user = await verifySessionToken(token);
  }

  return {
    user,
    req,
    res,
  };
}
