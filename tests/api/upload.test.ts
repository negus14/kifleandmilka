/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';
import * as auth from '@/lib/auth';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock R2 and S3
vi.mock('@/lib/r2', () => ({
  r2: {},
  R2_BUCKET: 'test-bucket',
  R2_PUBLIC_URL: 'https://assets.example.com',
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-upload-url.com'),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 30 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}));

const createRequest = (body: any) =>
  new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set required env vars
    process.env.R2_ACCOUNT_ID = 'test-account';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const res = await POST(createRequest({ fileName: 'test.jpg', contentType: 'image/jpeg' }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if fileName is missing', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await POST(createRequest({ contentType: 'image/jpeg' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/fileName and contentType required/);
  });

  it('should return 400 if contentType is missing', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await POST(createRequest({ fileName: 'test.jpg' }));
    const data = await res.json();

    expect(res.status).toBe(400);
  });

  it('should return 400 if file type is not allowed', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await POST(createRequest({ fileName: 'test.pdf', contentType: 'application/pdf' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/File type not allowed/);
  });

  it('should return 400 if file is too large', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await POST(createRequest({
      fileName: 'big.jpg',
      contentType: 'image/jpeg',
      fileSize: 15 * 1024 * 1024, // 15MB
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/too large/);
  });

  it('should return signed upload URL on success', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });

    const res = await POST(createRequest({
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.uploadUrl).toBe('https://signed-upload-url.com');
    expect(data.publicUrl).toMatch(/^https:\/\/assets\.example\.com\/sites\/test-site\//);
  });

  it('should accept all allowed image types', async () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

    for (const contentType of allowedTypes) {
      vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site', isPaid: false });
      const res = await POST(createRequest({ fileName: 'img.jpg', contentType }));
      expect(res.status).toBe(200);
    }
  });
});
