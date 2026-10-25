import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { ensureAdmin } from '../src/services/authService';
import { resetDb, PASSWORD } from './helpers';

describe('ensureAdmin', () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it('creates an admin who can log in', async () => {
    await ensureAdmin({ email: 'Admin@Example.com', password: PASSWORD });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('is idempotent and promotes an existing user', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: PASSWORD });
    await ensureAdmin({ email: 'a@example.com', password: PASSWORD });
    await ensureAdmin({ email: 'a@example.com', password: PASSWORD });

    expect(await prisma.user.count()).toBe(1);
    expect((await prisma.user.findUnique({ where: { email: 'a@example.com' } }))?.role).toBe('ADMIN');
  });
});