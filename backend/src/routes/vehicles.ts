import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { vehicleInputSchema, searchQuerySchema, vehicleUpdateSchema } from '../schemas';
import * as vehicleService from '../services/vehicleService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../utils/validate';
import { HttpError } from '../errors';

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

vehiclesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid vehicle id');
    const data = validate(vehicleUpdateSchema, req.body);
    res.json(await vehicleService.updateVehicle(id, data));
  }),
);