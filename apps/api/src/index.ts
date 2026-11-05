import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authRouter } from './auth';
import { usersRouter } from './users';
import { livekitRouter } from './livekit';
import { verifyRouter } from './verify';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/livekit', livekitRouter);
app.use('/api/v1/verify', verifyRouter);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'liveconnect-api' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log('API running on port ' + port);
});
