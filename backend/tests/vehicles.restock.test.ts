import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('POST /api/vehicles/:id/restock', () => {
  let userToken: string;
  let adminToken: string;
  let id: number;
  beforeEach(async () => {
    await resetDb();
    userToken = await tokenFor('USER');
    adminToken = await tokenFor('ADMIN');
    id = (await prisma.vehicle.create({ data: { ...sampleVehicle, quantity: 2 } })).id;
  });
  afterAll(() => prisma.$disconnect());

  const restock = (vehicleId: number, token: string | undefined, body: object) => {
    const req = request(app).post(`/api/vehicles/${vehicleId}/restock`);
    return (token ? req.set('Authorization', `Bearer ${token}`) : req).send(body);
  };
  const stock = async () => (await prisma.vehicle.findUnique({ where: { id } }))?.quantity;

  it('returns 401 without a token', async () => {
    expect((await restock(id, undefined, { quantity: 5 })).status).toBe(401);
  });

  it('returns 403 for a non-admin and leaves stock unchanged', async () => {
    expect((await restock(id, userToken, { quantity: 5 })).status).toBe(403);
    expect(await stock()).toBe(2);
  });

  it('increases stock for an admin', async () => {
    const res = await restock(id, adminToken, { quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(7);
    expect(await stock()).toBe(7);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await restock(99999, adminToken, { quantity: 5 })).status).toBe(404);
  });

  it.each([{}, { quantity: 0 }, { quantity: -3 }, { quantity: 1.5 }, { quantity: 'ten' }])(
    'rejects body %j with 400',
    async (body) => {
      expect((await restock(id, adminToken, body)).status).toBe(400);
    },
  );
});