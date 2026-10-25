import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('POST /api/vehicles', () => {
  let token: string;
  beforeEach(async () => {
    await resetDb();
    token = await tokenFor('USER');
  });
  afterAll(() => prisma.$disconnect());

  const create = (body: object) =>
    request(app).post('/api/vehicles').set('Authorization', `Bearer ${token}`).send(body);

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(sampleVehicle);
    expect(res.status).toBe(401);
  });

  it('creates a vehicle and returns 201 with an id', async () => {
    const res = await create(sampleVehicle);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(sampleVehicle);
    expect(typeof res.body.id).toBe('number');
  });

  it('persists the vehicle', async () => {
    await create(sampleVehicle);
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it.each([
    ['missing make', { ...sampleVehicle, make: undefined }],
    ['empty model', { ...sampleVehicle, model: '' }],
    ['zero price', { ...sampleVehicle, price: 0 }],
    ['negative price', { ...sampleVehicle, price: -1 }],
    ['string price', { ...sampleVehicle, price: 'cheap' }],
    ['negative quantity', { ...sampleVehicle, quantity: -1 }],
    ['fractional quantity', { ...sampleVehicle, quantity: 1.5 }],
  ])('rejects %s with 400', async (_name, body) => {
    const res = await create(body);
    expect(res.status).toBe(400);
  });
});