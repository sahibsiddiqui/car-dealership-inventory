import { prisma } from '../db';
import { VehicleInput } from '../schemas';

export function createVehicle(data: VehicleInput) {
  return prisma.vehicle.create({ data });
}

export function listVehicles() {
  return prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
}