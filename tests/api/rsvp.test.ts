/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/rsvp/route';
import { NextRequest } from 'next/server';
import * as sites from '@/lib/data/sites';
import * as db from '@/lib/db';
import { google } from 'googleapis';

// Mock dependencies
vi.mock('@/lib/data/sites', () => ({
  getSiteBySlug: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

const mockAppend = vi.fn();
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: class {
        constructor() {}
      },
      OAuth2: class {
        setCredentials() {}
      },
    },
    sheets: vi.fn(() => ({
      spreadsheets: {
        values: {
          append: mockAppend,
        },
      },
    })),
  },
}));

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';
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

  it('should return 400 if site is not found or googleSheetId is missing', async () => {
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null);

    const req = createRequest({
      slug: 'unknown-site',
      guests: [{ name: 'John Doe', attending: true }],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Google Sheets integration not configured/);
  });

  it('should successfully append to google sheets using Service Account', async () => {
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce({
      slug: 'test-site',
      googleSheetId: 'test-sheet-id',
      // No googleTokens -> fallback to Service Account
    } as any);

    mockAppend.mockResolvedValueOnce({});

    const req = createRequest({
      slug: 'test-site',
      email: 'john@example.com',
      message: 'Cant wait!',
      guests: [
        { name: 'John Doe', attending: true, mealChoice: 'Chicken', isHalal: true },
      ],
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    expect(mockAppend).toHaveBeenCalledTimes(1);
    expect(mockAppend.mock.calls[0][0].spreadsheetId).toBe('test-sheet-id');
    expect(mockAppend.mock.calls[0][0].requestBody.values[0]).toEqual(
      expect.arrayContaining([
        'john@example.com',
        'John Doe',
        'Yes', // Attending
        'Chicken',
        'Yes', // Halal
        'Cant wait!',
      ])
    );
  });
});
