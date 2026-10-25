import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('DELETE /api/vehicles/:id', () => {
  let userToken: string;
  let adminToken: string;
  let id: number;
  beforeEach(async () => {
    await resetDb();
    userToken = await tokenFor('USER');
    adminToken = await tokenFor('ADMIN');
    id = (await prisma.vehicle.create({ data: sampleVehicle })).id;
  });
  afterAll(() => prisma.$disconnect());

  const del = (vehicleId: number, token?: string) => {
    const req = request(app).delete(`/api/vehicles/${vehicleId}`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('returns 401 without a token', async () => {
    expect((await del(id)).status).toBe(401);
  });

  it('returns 403 for a non-admin and keeps the vehicle', async () => {
    expect((await del(id, userToken)).status).toBe(403);
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it('deletes the vehicle for an admin and returns 204', async () => {
    expect((await del(id, adminToken)).status).toBe(204);
    expect(await prisma.vehicle.count()).toBe(0);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await del(99999, adminToken)).status).toBe(404);
  });
});