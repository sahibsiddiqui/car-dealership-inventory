import { prisma } from '../db';
import { VehicleInput, SearchFilters, VehicleUpdate } from '../schemas';
import { HttpError } from '../errors';

export function createVehicle(data: VehicleInput) {
  return prisma.vehicle.create({ data });
}

export function listVehicles() {
  return prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
}

export function searchVehicles(filters: SearchFilters) {
  const { make, model, category, minPrice, maxPrice } = filters;
  return prisma.vehicle.findMany({
    where: {
      make: make ? { contains: make } : undefined,
      model: model ? { contains: model } : undefined,
      category: category ? { contains: category } : undefined,
      price:
        minPrice !== undefined || maxPrice !== undefined
          ? { gte: minPrice, lte: maxPrice }
          : undefined,
    },
    orderBy: { id: 'asc' },
  });
}

export async function getVehicleOrThrow(id: number) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new HttpError(404, 'Vehicle not found');
  return vehicle;
}

export async function updateVehicle(id: number, data: VehicleUpdate) {
  await getVehicleOrThrow(id);
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: number) {
  await getVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
}