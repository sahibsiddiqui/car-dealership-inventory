import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('GET /api/vehicles', () => {
  let token: string;
  beforeEach(async () => {
    await resetDb();
    token = await tokenFor('USER');
  });
  afterAll(() => prisma.$disconnect());

  const list = () => request(app).get('/api/vehicles').set('Authorization', `Bearer ${token}`);

  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles')).status).toBe(401);
  });

  it('returns an empty array when there are no vehicles', async () => {
    const res = await list();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all vehicles, including sold-out ones', async () => {
    await prisma.vehicle.create({ data: sampleVehicle });
    await prisma.vehicle.create({ data: { ...sampleVehicle, model: 'Corolla', quantity: 0 } });

    const res = await list();

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((v: { quantity: number }) => v.quantity)).toEqual([5, 0]);
  });
});