import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

import tokenRoutes from '../../routes/token.js';
import sessionRoutes from '../../routes/session.js';
import analysisRoutes from '../../routes/analysis.js';
import profileRoutes from '../../routes/profile.js';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/token', tokenRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const handler = serverless(app);
