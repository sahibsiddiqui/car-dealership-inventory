import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, PASSWORD } from './helpers';

describe('POST /api/auth/register', () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  const register = (body: object) => request(app).post('/api/auth/register').send(body);

  it('creates a user and never exposes the password', async () => {
    const res = await register({ email: 'a@example.com', password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'a@example.com', role: 'USER' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('stores a hashed password, not the plain one', async () => {
    await register({ email: 'a@example.com', password: PASSWORD });
    const user = await prisma.user.findUnique({ where: { email: 'a@example.com' } });

    expect(user?.passwordHash).toBeDefined();
    expect(user?.passwordHash).not.toBe(PASSWORD);
  });

  it('rejects a duplicate email with 409', async () => {
    await register({ email: 'a@example.com', password: PASSWORD });
    const res = await register({ email: 'A@example.com', password: PASSWORD });

    expect(res.status).toBe(409);
  });

  it('rejects an invalid email with 400', async () => {
    expect((await register({ email: 'nope', password: PASSWORD })).status).toBe(400);
  });

  it('rejects a short password with 400', async () => {
    expect((await register({ email: 'a@example.com', password: 'short' })).status).toBe(400);
  });

  it('ignores a role in the body and always creates a USER', async () => {
    const res = await register({ email: 'a@example.com', password: PASSWORD, role: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
  });
});