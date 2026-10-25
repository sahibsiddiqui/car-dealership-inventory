import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor, sampleVehicle } from './helpers';

describe('POST /api/vehicles/:id/purchase', () => {
  let token: string;
  beforeEach(async () => {
    await resetDb();
    token = await tokenFor('USER');
  });
  afterAll(() => prisma.$disconnect());

  const seed = (quantity: number) => prisma.vehicle.create({ data: { ...sampleVehicle, quantity } });
  const purchase = (id: number | string, body?: object) =>
    request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send(body ?? {});
  const stock = async (id: number) => (await prisma.vehicle.findUnique({ where: { id } }))?.quantity;

  it('returns 401 without a token', async () => {
    const v = await seed(3);
    expect((await request(app).post(`/api/vehicles/${v.id}/purchase`)).status).toBe(401);
  });

  it('decrements stock by 1 by default', async () => {
    const v = await seed(3);
    const res = await purchase(v.id);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
    expect(await stock(v.id)).toBe(2);
  });

  it('decrements by a requested quantity', async () => {
    const v = await seed(5);
    const res = await purchase(v.id, { quantity: 3 });

    expect(res.status).toBe(200);
    expect(await stock(v.id)).toBe(2);
  });

  it('returns 409 and leaves stock unchanged when sold out', async () => {
    const v = await seed(0);

    expect((await purchase(v.id)).status).toBe(409);
    expect(await stock(v.id)).toBe(0);
  });

  it('returns 409 when asking for more than is in stock', async () => {
    const v = await seed(2);

    expect((await purchase(v.id, { quantity: 3 })).status).toBe(409);
    expect(await stock(v.id)).toBe(2);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await purchase(99999)).status).toBe(404);
  });

  it.each([0, -1, 1.5])('rejects quantity %p with 400', async (quantity) => {
    const v = await seed(5);
    expect((await purchase(v.id, { quantity })).status).toBe(400);
  });

  it('never oversells under concurrent purchases', async () => {
    const v = await seed(1);
    const results = await Promise.all([purchase(v.id), purchase(v.id)]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await stock(v.id)).toBe(0);
  });
});