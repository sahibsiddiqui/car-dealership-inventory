import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { vehiclesRouter } from './routes/vehicles';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);

app.use(errorHandler);