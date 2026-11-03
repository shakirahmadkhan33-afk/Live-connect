import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, userProfiles } from './db/schema';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }
}

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      isVerified: users.isVerified,
      displayName: userProfiles.displayName,
      bio: userProfiles.bio,
      avatarUrl: userProfiles.avatarUrl,
      language: userProfiles.language,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, req.userId as string))
    .limit(1);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'user_not_found' });
  }
  return res.json(rows[0]);
});
