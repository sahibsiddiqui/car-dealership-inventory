import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { HttpError } from '../errors';

export type Role = 'USER' | 'ADMIN';
export interface Credentials {
  email: string;
  password: string;
}

export async function registerUser({ email, password }: Credentials) {
  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalized, passwordHash, role: 'USER' },
  });
  return { id: user.id, email: user.email, role: user.role as Role };
}