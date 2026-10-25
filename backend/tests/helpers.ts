import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';

export const PASSWORD = 'Password123!';

export const sampleVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
};

export async function resetDb() {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}

export async function tokenFor(role: 'USER' | 'ADMIN') {
  const email = `${role.toLowerCase()}@example.com`;
  await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(PASSWORD, 4), role },
  });
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return res.body.token as string;
}