/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';
import * as auth from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  destroySession: vi.fn(),
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should destroy session and redirect to login', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });

    const res = await POST(req);

    expect(auth.destroySession).toHaveBeenCalled();
    expect(res.status).toBe(307); // redirect status
    expect(res.headers.get('location')).toContain('/login?loggedOut=true');
  });
});
