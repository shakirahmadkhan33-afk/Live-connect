import { Router } from 'express';
import { createHash, randomInt } from 'crypto';
import { z } from 'zod';
import { eq, and, isNull, gt, desc } from 'drizzle-orm';
import { db } from './db';
import { users, emailVerifications } from './db/schema';
import { requireAuth, AuthedRequest } from './users';
import { sendEmail } from './email';

export const verifyRouter = Router();

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(userId: string, code: string): string {
  return createHash('sha256').update(userId + ':' + code).digest('hex');
}

async function issueCode(userId: string, email: string) {
  const [last] = await db
    .select()
    .from(emailVerifications)
    .where(and(
      eq(emailVerifications.userId, userId),
      eq(emailVerifications.purpose, 'verify_email'),
    ))
    .orderBy(desc(emailVerifications.createdAt))
    .limit(1);

  if (last && Date.now() - last.createdAt.getTime() < RESEND_WAIT_MS) {
    return { error: 'too_soon' as const };
  }

  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  await db.insert(emailVerifications).values({
    userId,
    email,
    codeHash: hashCode(userId, code),
    purpose: 'verify_email',
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  const sent = await sendEmail(
    email,
    'Your LiveConnect code',
    'Your verification code is ' + code + '. It expires in 10 minutes.',
  );
  if (!sent) return { error: 'email_failed' as const };
  return { ok: true as const };
}

async function handleSend(req: AuthedRequest, res: any) {
  try {
    if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
    const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    if (user.isVerified) return res.json({ success: true, alreadyVerified: true });
    if (!user.email) return res.status(400).json({ error: 'no_email' });

    const r = await issueCode(user.id, user.email);
    if ('error' in r) {
      const status = r.error === 'too_soon' ? 429 : 502;
      return res.status(status).json({ error: r.error });
    }
    return res.json({ success: true });
  } catch (e) {
    console.error('send-code error:', e);
    return res.status(500).json({ error: 'send_failed' });
  }
}

verifyRouter.post('/send-code', requireAuth, handleSend);
verifyRouter.post('/resend-code', requireAuth, handleSend);

const codeSchema = z.object({ code: z.string().regex(/^[0-9]{6}$/) });

verifyRouter.post('/verify-code', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
    const parsed = codeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

    const [row] = await db
      .select()
      .from(emailVerifications)
      .where(and(
        eq(emailVerifications.userId, req.userId),
        eq(emailVerifications.purpose, 'verify_email'),
        isNull(emailVerifications.usedAt),
        gt(emailVerifications.expiresAt, new Date()),
      ))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    if (!row) return res.status(400).json({ error: 'code_expired_or_missing' });
    if (row.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    if (row.codeHash !== hashCode(req.userId, parsed.data.code)) {
      await db
        .update(emailVerifications)
        .set({ attempts: row.attempts + 1 })
        .where(eq(emailVerifications.id, row.id));
      return res.status(400).json({ error: 'wrong_code' });
    }

    await db.transaction(async (tx) => {
      await tx.update(emailVerifications).set({ usedAt: new Date() }).where(eq(emailVerifications.id, row.id));
      await tx.update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, req.userId as string));
    });
    return res.json({ success: true });
  } catch (e) {
    console.error('verify-code error:', e);
    return res.status(500).json({ error: 'verify_failed' });
  }
});
