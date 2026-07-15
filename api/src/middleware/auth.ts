import { Context, Next } from 'hono';
import { jwtVerify, SignJWT } from 'jose';
import type { Env } from '../db';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    c.set('userId', payload.sub as string);
    c.set('userTier', payload.tier as string);
    c.set('userEmail', payload.email as string);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

export async function optionalAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      c.set('userId', payload.sub as string);
      c.set('userTier', payload.tier as string);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  await next();
}

export async function createToken(userId: string, email: string, tier: string, secret: string): Promise<string> {
  return new SignJWT({ sub: userId, email, tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));
}
