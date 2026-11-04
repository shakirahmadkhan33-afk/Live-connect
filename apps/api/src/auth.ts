import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq, or, and, isNull, gt } from 'drizzle-orm';
import { db } from './db';
import { users, userProfiles, refreshSessions } from './db/schema';

export const authRouter = Router();

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function refreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET missing');
  return secret;
}

function accessSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return secret;
}

function createRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, refreshSecret(), {
    expiresIn: '30d',
  });
}

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  password: z.string().min(8).max(100),
}).refine((d) => d.email || d.phone, {
  message: 'email or phone is required',
});

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'invalid_input',
      details: parsed.error.flatten(),
    });
  }

  const { username, email, phone, password } = parsed.data;

  const conditions = [eq(users.username, username)];
  if (email) conditions.push(eq(users.email, email));
  if (phone) conditions.push(eq(users.phone, phone));

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(...conditions))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: 'user_already_exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ username, email, phone, passwordHash })
    .returning({ id: users.id, username: users.username });

  await db.insert(userProfiles).values({
    userId: user.id,
    displayName: username,
  });

  return res.status(201).json({
    id: user.id,
    username: user.username,
  });
});

const loginSchema = z.object({
  identifier: z.string().min(3).max(100),
  password: z.string().min(1).max(100),
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  const { identifier, password } = parsed.data;

  const found = await db
    .select()
    .from(users)
    .where(or(
      eq(users.username, identifier),
      eq(users.email, identifier),
      eq(users.phone, identifier),
    ))
    .limit(1);

  const user = found[0];

  const valid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'account_not_active' });
  }

  const accessToken = jwt.sign(
    { sub: user.id },
    accessSecret(),
    { expiresIn: '15m' },
  );

  const refreshToken = createRefreshToken(user.id);

  await db.insert(refreshSessions).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20).max(2000),
});

authRouter.post('/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  const oldToken = parsed.data.refreshToken;

  let payload: { sub: string };

  try {
    payload = jwt.verify(oldToken, refreshSecret()) as { sub: string };

    if (!payload.sub) {
      return res.status(401).json({ error: 'invalid_refresh_token' });
    }
  } catch {
    return res.status(401).json({ error: 'invalid_or_expired_refresh_token' });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [session] = await tx
        .select()
        .from(refreshSessions)
        .where(and(
          eq(refreshSessions.tokenHash, hashToken(oldToken)),
          eq(refreshSessions.userId, payload.sub),
          isNull(refreshSessions.revokedAt),
          gt(refreshSessions.expiresAt, new Date()),
        ))
        .limit(1);

      if (!session) return { error: 'session_invalid' as const };

      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (!user || user.status !== 'active') {
        await tx
          .update(refreshSessions)
          .set({ revokedAt: new Date() })
          .where(eq(refreshSessions.id, session.id));

        return { error: 'account_not_active' as const };
      }

      const [revoked] = await tx
        .update(refreshSessions)
        .set({ revokedAt: new Date() })
        .where(and(
          eq(refreshSessions.id, session.id),
          isNull(refreshSessions.revokedAt),
        ))
        .returning({ id: refreshSessions.id });

      if (!revoked) return { error: 'session_invalid' as const };

      const newRefreshToken = createRefreshToken(user.id);

      await tx.insert(refreshSessions).values({
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const newAccessToken = jwt.sign(
        { sub: user.id },
        accessSecret(),
        { expiresIn: '15m' },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    });

    if ('error' in result) {
      return res.status(401).json({ error: result.error });
    }

    return res.json(result);
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'refresh_failed' });
  }
});

authRouter.post('/logout', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input' });
  }

  try {
    const result = await db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(refreshSessions.tokenHash, hashToken(parsed.data.refreshToken)),
        isNull(refreshSessions.revokedAt),
      ))
      .returning({ id: refreshSessions.id });

    return res.json({
      success: true,
      revoked: result.length > 0,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'logout_failed' });
  }
});
