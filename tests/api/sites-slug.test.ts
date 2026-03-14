/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, GET } from '@/app/api/sites/[slug]/route';
import * as sites from '@/lib/data/sites';
import * as auth from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('@/lib/data/sites', () => ({
  getSiteBySlug: vi.fn(),
  updateSite: vi.fn(),
  renameSite: vi.fn(),
}));

const createRequest = (body: any, slug: string, method = 'PUT') => {
  return new Request(`http://localhost:3000/api/sites/${slug}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

const createGetRequest = (slug: string, query = '') => {
  return new Request(`http://localhost:3000/api/sites/${slug}${query}`, {
    method: 'GET',
  });
};

const makeParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe('PUT /api/sites/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const req = createRequest({ partner1Name: 'Alice' }, 'test-site');
    const res = await PUT(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 if session slug does not match', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'other-site' });

    const req = createRequest({ partner1Name: 'Alice' }, 'test-site');
    const res = await PUT(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  // ─── Standard Update ───
  it('should update site successfully', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.updateSite).mockResolvedValueOnce({ slug: 'test-site', partner1Name: 'Bob' } as any);

    const req = createRequest({ partner1Name: 'Bob' }, 'test-site');
    const res = await PUT(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(sites.updateSite).toHaveBeenCalledWith('test-site', { partner1Name: 'Bob' });
  });

  it('should return 404 if site not found on update', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.updateSite).mockResolvedValueOnce(null);

    const req = createRequest({ partner1Name: 'Bob' }, 'test-site');
    const res = await PUT(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toMatch(/Site not found/);
  });

  // ─── Rename Cases ───
  it('should reject slug with invalid characters', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });

    const req = createRequest({ slug: 'INVALID_Slug!' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/lowercase letters, numbers, and hyphens/);
  });

  it('should reject slug that is too short', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });

    const req = createRequest({ slug: 'ab' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/too short/);
  });

  it('should reject reserved slugs', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });

    const req = createRequest({ slug: 'dashboard' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/reserved/);
  });

  it('should reject slug that is already taken', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce({ slug: 'taken-slug' } as any);

    const req = createRequest({ slug: 'taken-slug' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/already taken/);
  });

  it('should rename site successfully', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null); // no conflict
    vi.mocked(sites.renameSite).mockResolvedValueOnce({ slug: 'new-slug' } as any);

    const req = createRequest({ slug: 'new-slug', partner1Name: 'Alice' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.newSlug).toBe('new-slug');
    expect(sites.renameSite).toHaveBeenCalledWith('old-slug', 'new-slug', { slug: 'new-slug', partner1Name: 'Alice' });
    expect(auth.createSession).toHaveBeenCalledWith('new-slug');
  });

  it('should return 404 if site not found during rename', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'old-slug' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null); // no conflict
    vi.mocked(sites.renameSite).mockResolvedValueOnce(null);

    const req = createRequest({ slug: 'new-slug' }, 'old-slug');
    const res = await PUT(req, makeParams('old-slug'));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Site not found');
  });

  it('should not rename if slug is unchanged', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.updateSite).mockResolvedValueOnce({ slug: 'test-site' } as any);

    const req = createRequest({ slug: 'test-site', partner1Name: 'Bob' }, 'test-site');
    const res = await PUT(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    // Should use updateSite, not renameSite
    expect(sites.updateSite).toHaveBeenCalled();
    expect(sites.renameSite).not.toHaveBeenCalled();
  });
});

describe('GET /api/sites/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null);

    const req = createGetRequest('test-site');
    const res = await GET(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 if session slug does not match', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'other-site' });

    const req = createGetRequest('test-site');
    const res = await GET(req, makeParams('test-site'));

    expect(res.status).toBe(401);
  });

  it('should return site data successfully', async () => {
    const mockSite = { slug: 'test-site', partner1Name: 'Alice' };
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(mockSite as any);

    const req = createGetRequest('test-site');
    const res = await GET(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockSite);
  });

  it('should return 404 if site not found', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce(null);

    const req = createGetRequest('test-site');
    const res = await GET(req, makeParams('test-site'));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Site not found');
  });

  it('should bypass cache when nocache=true', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({ slug: 'test-site' });
    vi.mocked(sites.getSiteBySlug).mockResolvedValueOnce({ slug: 'test-site' } as any);

    const req = createGetRequest('test-site', '?nocache=true');
    const res = await GET(req, makeParams('test-site'));

    expect(res.status).toBe(200);
    expect(sites.getSiteBySlug).toHaveBeenCalledWith('test-site', true);
  });
});
