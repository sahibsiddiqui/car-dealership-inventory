import { prisma } from '../db';
import { VehicleInput, SearchFilters } from '../schemas';

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