import { Router } from 'express';
import { z } from 'zod';
import { registerUser } from '../services/authService';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Valid email and a password of 8+ characters required' });
    }
    const user = await registerUser(parsed.data);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});