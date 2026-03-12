/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession, getSession, destroySession } from '@/lib/auth';
import * as jose from 'jose';

// Mock next/headers cookies
const mockSet = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
  })),
}));

describe('Auth Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a JWT and set it in a cookie', async () => {
      await createSession('test-slug');

      expect(mockSet).toHaveBeenCalledWith(
        'itsw_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 604800, // 7 days
          path: '/',
        })
      );
    });
  });

  describe('getSession', () => {
    it('should return null if no cookie is present', async () => {
      mockGet.mockReturnValue(undefined);
      
      const session = await getSession();
      expect(session).toBeNull();
    });

    it('should return payload if token is valid', async () => {
      // Create a valid token first
      const SECRET = new TextEncoder().encode(
        process.env.AUTH_SECRET || "dev-secret-change-in-production"
      );
      const token = await new jose.SignJWT({ slug: 'test-slug' })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(SECRET);

      mockGet.mockReturnValue({ value: token });

      const session = await getSession();
      expect(session).toMatchObject({ slug: 'test-slug' });
    });

    it('should return null if token is invalid', async () => {
      mockGet.mockReturnValue({ value: 'invalid-token' });

      const session = await getSession();
      expect(session).toBeNull();
    });
  });

  describe('destroySession', () => {
    it('should delete the session cookie', async () => {
      await destroySession();
      expect(mockDelete).toHaveBeenCalledWith('itsw_session');
    });
  });
});
