import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { resetDb, tokenFor } from './helpers';

describe('GET /api/vehicles/search', () => {
  let token: string;
  beforeEach(async () => {
    await resetDb();
    token = await tokenFor('USER');
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 3 },
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 2 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 },
      ],
    });
  });
  afterAll(() => prisma.$disconnect());

  const search = (qs: string) =>
    request(app).get(`/api/vehicles/search${qs}`).set('Authorization', `Bearer ${token}`);
  const models = (body: { model: string }[]) => body.map((v) => v.model).sort();

  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles/search')).status).toBe(401);
  });

  it('returns everything when no filters are given', async () => {
    const res = await search('');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('filters by make, case-insensitive and partial', async () => {
    expect(models((await search('?make=toy')).body)).toEqual(['Camry', 'RAV4']);
  });

  it('filters by model', async () => {
    expect(models((await search('?model=civ')).body)).toEqual(['Civic']);
  });

  it('filters by category', async () => {
    expect(models((await search('?category=sedan')).body)).toEqual(['Camry', 'Civic']);
  });

  it('filters by a price range', async () => {
    expect(models((await search('?minPrice=23000&maxPrice=30000')).body)).toEqual(['Camry']);
  });

  it('filters by minPrice only', async () => {
    expect(models((await search('?minPrice=30000')).body)).toEqual(['RAV4']);
  });

  it('combines filters', async () => {
    expect(models((await search('?make=toyota&category=sedan')).body)).toEqual(['Camry']);
  });

  it('returns an empty array when nothing matches', async () => {
    const res = await search('?make=ferrari');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('rejects a non-numeric price with 400', async () => {
    expect((await search('?minPrice=abc')).status).toBe(400);
  });
});