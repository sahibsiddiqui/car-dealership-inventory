import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { HttpError } from '../errors';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config';

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

export async function loginUser({ email, password }: Credentials) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordOk) throw new HttpError(401, 'Invalid email or password');

  const token = jwt.sign({ sub: String(user.id), role: user.role }, getJwtSecret(), {
    expiresIn: '1h',
  });
  return { token, user: { id: user.id, email: user.email, role: user.role as Role } };
}

export async function ensureAdmin({ email, password }: Credentials) {
  const normalized = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email: normalized },
    update: { role: 'ADMIN', passwordHash },
    create: { email: normalized, passwordHash, role: 'ADMIN' },
  });
}