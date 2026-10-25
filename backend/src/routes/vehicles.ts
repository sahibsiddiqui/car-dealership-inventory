import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { vehicleInputSchema } from '../schemas';
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