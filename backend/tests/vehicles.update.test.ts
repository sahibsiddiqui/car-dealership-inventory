import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('PUT /api/vehicles/:id', () => {
  let token: string;
  let id: number;
  beforeEach(async () => {
    await resetDb();
    token = await tokenFor('USER');
    id = (await prisma.vehicle.create({ data: sampleVehicle })).id;
  });
  afterAll(() => prisma.$disconnect());

  const update = (vehicleId: number | string, body: object) =>
    request(app).put(`/api/vehicles/${vehicleId}`).set('Authorization', `Bearer ${token}`).send(body);

  it('returns 401 without a token', async () => {
    expect((await request(app).put(`/api/vehicles/${id}`).send({ price: 1 })).status).toBe(401);
  });

  it('updates only the supplied fields', async () => {
    const res = await update(id, { price: 27000 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...sampleVehicle, price: 27000 });
    expect((await prisma.vehicle.findUnique({ where: { id } }))?.price).toBe(27000);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await update(99999, { price: 1000 })).status).toBe(404);
  });

  it('returns 400 for an empty body', async () => {
    expect((await update(id, {})).status).toBe(400);
  });

  it('returns 400 for an invalid value', async () => {
    expect((await update(id, { price: -5 })).status).toBe(400);
  });

  it('returns 400 for a non-numeric id', async () => {
    expect((await update('abc', { price: 1000 })).status).toBe(400);
  });
});