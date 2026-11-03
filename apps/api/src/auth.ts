import jwt from 'jsonwebtoken';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { db } from './db';
import { users, userProfiles } from './db/schema';

export const authRouter = Router();

const registerSchema = z
  .object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(8).max(100),
  })
  .refine((d) => d.email || d.phone, {
    message: 'email or phone is required',
  });

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { username, email, phone, password } = parsed.data;

  const conditions = [eq(users.username, username)];
  if (email) conditions.push(eq(users.email, email));
  if (phone) conditions.push(eq(users.phone, phone));
  const existing = await db.select({ id: users.id }).from(users).where(or(...conditions)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'user_already_exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ username, email, phone, passwordHash })
    .returning({ id: users.id, username: users.username });
  await db.insert(userProfiles).values({ userId: user.id, displayName: username });

  return res.status(201).json({ id: user.id, username: user.username });
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
    .where(or(eq(users.username, identifier), eq(users.email, identifier), eq(users.phone, identifier)))
    .limit(1);
  const user = found[0];

  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'account_not_active' });
  }

  const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });

  return res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username } });
});
