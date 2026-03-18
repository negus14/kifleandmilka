/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/media/route';
import { NextRequest } from 'next/server';
import * as auth from '@/lib/auth';

// Use vi.hoisted for variables referenced inside vi.mock factories
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/r2', () => ({
  r2: { send: mockSend },
  R2_BUCKET: 'test-bucket',
  R2_PUBLIC_URL: 'https://assets.example.com',
}));

vi.mock('@aws-sdk/client-s3', () => ({
  ListObjectsV2Command: vi.fn(),
}));

const createRequest = () =>
  new NextRequest('http://localhost:3000/api/media', { method: 'GET' });

describe('GET /api/media', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.R2_ACCOUNT_ID = 'test-account';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const res = await GET(createRequest());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return images list on success', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const mockObjects = [
      { Key: 'sites/test-site/photo1.jpg', LastModified: new Date('2024-01-02'), Size: 1024 },
      { Key: 'sites/test-site/photo2.png', LastModified: new Date('2024-01-01'), Size: 2048 },
    ];
    mockSend.mockResolvedValue({ Contents: mockObjects });

    const res = await GET(createRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.images).toHaveLength(2);
    expect(data.images[0].url).toBe('https://assets.example.com/sites/test-site/photo1.jpg');
    expect(data.images[0].key).toBe('sites/test-site/photo1.jpg');
  });

  it('should filter out folder entries', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const mockObjects = [
      { Key: 'sites/test-site/', LastModified: new Date(), Size: 0 },
      { Key: 'sites/test-site/photo.jpg', LastModified: new Date(), Size: 1024 },
    ];
    mockSend.mockResolvedValue({ Contents: mockObjects });

    const res = await GET(createRequest());
    const data = await res.json();

    expect(data.images).toHaveLength(1);
    expect(data.images[0].key).toBe('sites/test-site/photo.jpg');
  });

  it('should return empty images when no objects exist', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });
    mockSend.mockResolvedValue({ Contents: undefined });

    const res = await GET(createRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.images).toHaveLength(0);
  });

  it('should return 503 if R2 config is missing', async () => {
    // Re-mock with null r2 client to simulate missing config
    const r2Module = await import('@/lib/r2');
    const originalR2 = r2Module.r2;
    Object.defineProperty(r2Module, 'r2', { value: null, writable: true });

    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await GET(createRequest());
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toMatch(/not configured/);

    // Restore
    Object.defineProperty(r2Module, 'r2', { value: originalR2, writable: true });
  });

  it('should sort images by lastModified descending', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const mockObjects = [
      { Key: 'sites/test-site/old.jpg', LastModified: new Date('2024-01-01'), Size: 1024 },
      { Key: 'sites/test-site/new.jpg', LastModified: new Date('2024-06-01'), Size: 2048 },
    ];
    mockSend.mockResolvedValue({ Contents: mockObjects });

    const res = await GET(createRequest());
    const data = await res.json();

    expect(data.images[0].key).toBe('sites/test-site/new.jpg');
    expect(data.images[1].key).toBe('sites/test-site/old.jpg');
  });
});
