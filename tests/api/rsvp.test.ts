/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/rsvp/route';
import { NextRequest } from 'next/server';
import * as sites from '@/lib/data/sites';
import * as rsvps from '@/lib/data/rsvps';
import * as googleSync from '@/lib/google-sheets';

// Mock dependencies
vi.mock('@/lib/data/sites', () => ({
  getSiteBySlug: vi.fn(),
}));

vi.mock('@/lib/data/rsvps', () => ({
  createRSVP: vi.fn(),
}));

vi.mock('@/lib/google-sheets', () => ({
  syncRSVPToGoogleSheets: vi.fn(),
}));

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should return 400 if slug or guests are missing', async () => {
    const req = createRequest({ slug: 'test' }); // missing guests
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Slug and at least one guest are required/);
  });

  it('should return 404 if site is not found', async () => {
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null);

    const req = createRequest({
      slug: 'unknown-site',
      guests: [{ name: 'John Doe', attending: true }],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Site not found');
  });

  it('should successfully save to DB and attempt sync', async () => {
    const mockSite = { slug: 'test-site' } as any;
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(mockSite);
    vi.mocked(rsvps.createRSVP).mockResolvedValueOnce({ id: 'rsvp-123' } as any);
    vi.mocked(googleSync.syncRSVPToGoogleSheets).mockResolvedValueOnce(true);

    const rsvpData = {
      slug: 'test-site',
      email: 'john@example.com',
      message: 'Cant wait!',
      guests: [
        { name: 'John Doe', attending: true, mealChoice: 'Chicken', isHalal: true },
      ],
    };

    const req = createRequest(rsvpData);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.rsvpId).toBe('rsvp-123');

    // Verify DB was called
    expect(rsvps.createRSVP).toHaveBeenCalledWith(
      'test-site',
      'john@example.com',
      rsvpData.guests,
      'Cant wait!'
    );

    // Verify Sync was called
    expect(googleSync.syncRSVPToGoogleSheets).toHaveBeenCalledWith(
      mockSite,
      'john@example.com',
      rsvpData.guests,
      'Cant wait!',
      'rsvp-123'
    );
  });
});
