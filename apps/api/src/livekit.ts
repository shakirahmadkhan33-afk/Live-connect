import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { requireAuth, AuthedRequest } from './users';
import { z } from 'zod';

export const livekitRouter = Router();

const roomSchema = z.object({
  roomName: z.string()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/),
});

livekitRouter.post(
  '/token',
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const parsed = roomSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: 'invalid_room_name',
        });
      }

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const serverUrl = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret || !serverUrl) {
        return res.status(503).json({
          error: 'livekit_not_configured',
        });
      }

      if (!req.userId) {
        return res.status(401).json({
          error: 'unauthorized',
        });
      }

      const roomName = parsed.data.roomName;

      const accessToken = new AccessToken(
        apiKey,
        apiSecret,
        {
          identity: req.userId,
          ttl: '10m',
        },
      );

      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await accessToken.toJwt();

      return res.json({
        serverUrl,
        token,
        roomName,
      });
    } catch (error) {
      console.error('LiveKit token error:', error);
      return res.status(500).json({
        error: 'livekit_token_failed',
      });
    }
  },
);
