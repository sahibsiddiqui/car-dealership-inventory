import jwt from 'jsonwebtoken';
import { HttpError } from '../src/errors';
import { authenticate, requireAdmin } from '../src/middleware/auth';

const secret = process.env.JWT_SECRET as string;
const reqWith = (authorization?: string) => ({ headers: { authorization } }) as any;
const statusOf = (next: jest.Mock) => (next.mock.calls[0][0] as HttpError).status;

describe('authenticate', () => {
  it('rejects a missing Authorization header with 401', () => {
    const next = jest.fn();
    authenticate(reqWith(), {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('rejects a non-Bearer header with 401', () => {
    const next = jest.fn();
    authenticate(reqWith('Basic abc'), {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('rejects a garbage token with 401', () => {
    const next = jest.fn();
    authenticate(reqWith('Bearer not-a-jwt'), {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('rejects a token signed with the wrong secret', () => {
    const next = jest.fn();
    const token = jwt.sign({ sub: '1', role: 'USER' }, 'other-secret');
    authenticate(reqWith(`Bearer ${token}`), {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('rejects an expired token with 401', () => {
    const next = jest.fn();
    const token = jwt.sign({ sub: '1', role: 'USER' }, secret, { expiresIn: -10 });
    authenticate(reqWith(`Bearer ${token}`), {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('accepts a valid token and attaches req.user', () => {
    const next = jest.fn();
    const req = reqWith(`Bearer ${jwt.sign({ sub: '7', role: 'ADMIN' }, secret)}`);
    authenticate(req, {} as any, next);

    expect(req.user).toEqual({ id: 7, role: 'ADMIN' });
    expect(next).toHaveBeenCalledWith();
  });
});

describe('requireAdmin', () => {
  it('returns 401 when there is no authenticated user', () => {
    const next = jest.fn();
    requireAdmin({} as any, {} as any, next);
    expect(statusOf(next)).toBe(401);
  });

  it('returns 403 for a non-admin user', () => {
    const next = jest.fn();
    requireAdmin({ user: { id: 1, role: 'USER' } } as any, {} as any, next);
    expect(statusOf(next)).toBe(403);
  });

  it('lets an admin through', () => {
    const next = jest.fn();
    requireAdmin({ user: { id: 1, role: 'ADMIN' } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});