import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { vehicleInputSchema, searchQuerySchema } from '../schemas';
import * as vehicleService from '../services/vehicleService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../utils/validate';

export const vehiclesRouter = Router();

vehiclesRouter.use(authenticate);

vehiclesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = validate(vehicleInputSchema, req.body);
    res.status(201).json(await vehicleService.createVehicle(data));
  }),
);

vehiclesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await vehicleService.listVehicles());
  }),
);

vehiclesRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const filters = validate(searchQuerySchema, req.query);
    res.json(await vehicleService.searchVehicles(filters));
  }),
);