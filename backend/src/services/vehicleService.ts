import { prisma } from '../db';
import { VehicleInput } from '../schemas';

export function createVehicle(data: VehicleInput) {
  return prisma.vehicle.create({ data });
}