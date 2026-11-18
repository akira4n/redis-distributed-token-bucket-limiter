import express from 'express';
import cors from 'cors';

import { httpLogger } from './infrastructure/logger.js';

const app = express();

app.use(cors());

app.use(httpLogger);
app.use(express.json());

app.get('/api/test', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Successfully.',
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
