/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/sites/[slug]/sync/route';
import { NextRequest } from 'next/server';
import * as auth from '@/lib/auth';
import * as sites from '@/lib/data/sites';
import * as rsvps from '@/lib/data/rsvps';
import * as googleSync from '@/lib/google-sheets';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/data/sites', () => ({
  getSiteBySlug: vi.fn(),
}));

vi.mock('@/lib/data/rsvps', () => ({
  getUnsyncedRSVPs: vi.fn(),
}));

vi.mock('@/lib/google-sheets', () => ({
  syncRSVPToGoogleSheets: vi.fn(),
}));

const makeRequest = (slug: string, method = 'POST') =>
  new NextRequest(`http://localhost:3000/api/sites/${slug}/sync`, { method });

const makeParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe('POST /api/sites/[slug]/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const res = await POST(makeRequest('test-site'), makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 if session slug does not match', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'other' });

    const res = await POST(makeRequest('test-site'), makeParams('test-site'));
    expect(res.status).toBe(401);
  });

  it('should return 404 if site not found', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null);

    const res = await POST(makeRequest('test-site'), makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Site not found');
  });

  it('should return success with count 0 if no unsynced RSVPs', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce({ slug: 'test-site' } as any);
    vi.mocked(rsvps.getUnsyncedRSVPs).mockResolvedValueOnce([]);

    const res = await POST(makeRequest('test-site'), makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBe(0);
  });

  it('should sync unsynced RSVPs and return counts', async () => {
    const mockSite = { slug: 'test-site' } as any;
    const mockRSVPs = [
      { id: 'r1', email: 'a@b.com', guests: [{ name: 'A', attending: true }], message: 'Hi', created_at: new Date() },
      { id: 'r2', email: 'c@d.com', guests: [{ name: 'B', attending: false }], message: null, created_at: new Date() },
    ] as any[];

    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(mockSite);
    vi.mocked(rsvps.getUnsyncedRSVPs).mockResolvedValueOnce(mockRSVPs);
    vi.mocked(googleSync.syncRSVPToGoogleSheets)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false); // second one fails

    const res = await POST(makeRequest('test-site'), makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
    expect(data.failed).toBe(1);
    expect(googleSync.syncRSVPToGoogleSheets).toHaveBeenCalledTimes(2);
  });
});

describe('GET /api/sites/[slug]/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const res = await GET(makeRequest('test-site', 'GET'), makeParams('test-site'));
    expect(res.status).toBe(401);
  });

  it('should return unsynced count', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(rsvps.getUnsyncedRSVPs).mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }] as any[]);

    const res = await GET(makeRequest('test-site', 'GET'), makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.unsyncedCount).toBe(2);
    expect(data.needsSync).toBe(true);
  });

  it('should return needsSync false when all synced', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(rsvps.getUnsyncedRSVPs).mockResolvedValueOnce([]);

    const res = await GET(makeRequest('test-site', 'GET'), makeParams('test-site'));
    const data = await res.json();

    expect(data.unsyncedCount).toBe(0);
    expect(data.needsSync).toBe(false);
  });
});
