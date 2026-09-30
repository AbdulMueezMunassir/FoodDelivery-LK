import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = 'customer' | 'owner' | 'admin';
export type SessionPayload = { sub: string; role: SessionRole };

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const key = getKey(); // a missing secret should fail loudly, not look like "logged out"

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    const role = payload.role;

    if (!payload.sub || (role !== 'customer' && role !== 'owner' && role !== 'admin')) {
      return null;
    }

    return { sub: payload.sub, role };
  } catch {
    return null; // bad signature, tampered, or expired
  }
}