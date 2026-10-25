import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, PASSWORD } from './helpers';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDb();
    await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: PASSWORD });
  });
  afterAll(() => prisma.$disconnect());

  const login = (body: object) => request(app).post('/api/auth/login').send(body);

  it('returns a signed JWT and the user on valid credentials', async () => {
    const res = await login({ email: 'a@example.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'a@example.com', role: 'USER' });
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET as string);
    expect(decoded).toMatchObject({ role: 'USER' });
  });

  it('rejects a wrong password with 401', async () => {
    const res = await login({ email: 'a@example.com', password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('rejects an unknown email with the same 401 message', async () => {
    const res = await login({ email: 'ghost@example.com', password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('rejects a missing password with 400', async () => {
    expect((await login({ email: 'a@example.com' })).status).toBe(400);
  });
});