import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { UserRole, VerificationStatus } from '../models/User';

const SECRET_KEY = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'super_secret_better_auth_jwt_key_min_32_chars'
);

export interface SessionPayload {
  sessionId?: string;
  userId: string;
  email: string;
  role: UserRole;
  status: VerificationStatus;
  matricNo?: string;
  fullName: string;
  canEditRegistration?: boolean;
}

export const COOKIE_NAME = 'sonuch_session';
export const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const sessionId = payload.sessionId || `sess_${crypto.randomUUID()}`;
  return new SignJWT({ ...payload, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });

  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionFromRequestToken(tokenStr?: string): Promise<SessionPayload | null> {
  if (!tokenStr) return null;
  return verifySessionToken(tokenStr);
}
