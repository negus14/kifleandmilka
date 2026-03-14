/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSiteBySlug, updateSite } from '@/lib/data/sites';
import redis from '@/lib/redis';
import { db } from '@/lib/db';

// Mock Redis
vi.mock('@/lib/redis', () => ({
  default: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      sites: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ slug: 'test-site' }]),
        }),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnValue({
        catch: vi.fn(),
      }),
    })),
  },
  default: {
    query: vi.fn(),
  }
}));

describe('sites data layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSiteBySlug', () => {
    it('should return cached data if available in Redis', async () => {
      const mockSite = { slug: 'test-site', partner1Name: 'Alice' };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(mockSite));

      const result = await getSiteBySlug('test-site');

      expect(result).toEqual(expect.objectContaining(mockSite));
      expect(redis.get).toHaveBeenCalledWith('site:test-site');
      expect(db.query.sites.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from DB and populate cache if Redis is empty', async () => {
      const mockSiteData = { partner1Name: 'Alice' };
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      vi.mocked(db.query.sites.findFirst).mockResolvedValueOnce({
        slug: 'test-site',
        data: mockSiteData,
      } as any);

      const result = await getSiteBySlug('test-site');

      expect(result).toEqual(expect.objectContaining(mockSiteData));
      expect(db.query.sites.findFirst).toHaveBeenCalled();
      expect(redis.setex).toHaveBeenCalledWith(
        'site:test-site',
        60,
        expect.anything()
      );
    });
  });

  describe('updateSite', () => {
    it('should invalidate cache after a successful update', async () => {
      const mockSiteData = { slug: 'test-site', partner1Name: 'Alice' };
      // 1st call: getSiteBySlug(slug, true) to get existing
      vi.mocked(db.query.sites.findFirst).mockResolvedValueOnce({
        slug: 'test-site',
        data: mockSiteData,
      } as any);
      // 2nd call: post-update verification getSiteBySlug(slug, true)
      vi.mocked(db.query.sites.findFirst).mockResolvedValueOnce({
        slug: 'test-site',
        data: { ...mockSiteData, partner1Name: 'Bob' },
      } as any);

      await updateSite('test-site', { partner1Name: 'Bob' });

      expect(redis.del).toHaveBeenCalledWith('site:test-site');
    });
  });
});
