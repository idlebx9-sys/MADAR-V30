import crypto from 'crypto';
import * as jose from 'jose';
import { ENV } from './env.ts';

const secretKey = new TextEncoder().encode(ENV.JWT_SECRET);

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'admin' | 'owner' | 'user';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, combined: string): Promise<boolean> {
  const parts = combined.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export async function signSessionToken(payload: TokenPayload, expiresIn = '14d'): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as 'admin' | 'owner' | 'user',
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
