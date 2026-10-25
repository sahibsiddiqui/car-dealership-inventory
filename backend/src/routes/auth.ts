import { Router } from 'express';
import { credentialsSchema, loginSchema } from '../schemas';
import { loginUser, registerUser } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../utils/validate';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const user = await registerUser(validate(credentialsSchema, req.body));
    res.status(201).json({ user });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    res.json(await loginUser(validate(loginSchema, req.body)));
  }),
);