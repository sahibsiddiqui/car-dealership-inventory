import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config';
import { HttpError } from '../errors';
import { Role } from '../services/authService';

export interface AuthUser {
  id: number;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }

  let user: AuthUser;
  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret());
    if (typeof payload === 'string' || !payload.sub) throw new Error('Bad payload');
    user = { id: Number(payload.sub), role: payload.role as Role };
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }

  req.user = user;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, 'Authentication required'));
  if (req.user.role !== 'ADMIN') return next(new HttpError(403, 'Admin access required'));
  next();
}