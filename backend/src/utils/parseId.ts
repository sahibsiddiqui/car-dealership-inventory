import { HttpError } from '../errors';

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid vehicle id');
  return id;
}