/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renameSite, createSite, getAllSlugs, getSiteBySlug } from '@/lib/data/sites';
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

// Mock DB with select chain
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockResolvedValue([
          { slug: 'alpha-wedding' },
          { slug: 'beta-wedding' },
        ]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ slug: 'new-slug' }]),
        }),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
  },
  default: {
    query: vi.fn(),
  },
}));

function mockDbSelect(result: any) {
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(result ? [result] : []),
    }),
  } as any);
}

describe('sites data layer - additional functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSiteBySlug with forceRefresh', () => {
    it('should skip cache when forceRefresh is true', async () => {
      mockDbSelect({
        data: { partner1Name: 'Alice' },
        isPaid: null,
        stripeCustomerId: null,
        customDomain: null,
      });

      await getSiteBySlug('test-site', true);

      expect(redis.get).not.toHaveBeenCalled();
      expect(db.select).toHaveBeenCalled();
    });

    it('should return null when site not found in DB', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      mockDbSelect(null);

      const result = await getSiteBySlug('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle Redis read errors gracefully', async () => {
      vi.mocked(redis.get).mockRejectedValueOnce(new Error('Redis down'));
      mockDbSelect({
        data: { partner1Name: 'Alice' },
        isPaid: null,
        stripeCustomerId: null,
        customDomain: null,
      });

      const result = await getSiteBySlug('test-site');

      expect(result).toEqual(expect.objectContaining({ partner1Name: 'Alice' }));
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('renameSite', () => {
    it('should rename site and invalidate both old and new cache keys', async () => {
      vi.mocked(redis.get).mockResolvedValue(null as any);
      // getSiteBySlug(oldSlug, true) → returns existing
      mockDbSelect({
        data: { slug: 'old-slug', partner1Name: 'Alice' },
        isPaid: null,
        stripeCustomerId: null,
        customDomain: null,
      });

      const result = await renameSite('old-slug', 'new-slug', { partner1Name: 'Bob' });

      expect(result).toBeTruthy();
      expect(result!.slug).toBe('new-slug');
      expect(result!.partner1Name).toBe('Bob');
      expect(redis.del).toHaveBeenCalledWith('site:old-slug');
      expect(redis.del).toHaveBeenCalledWith('site:new-slug');
    });

    it('should return null if original site not found', async () => {
      vi.mocked(redis.get).mockResolvedValue(null as any);
      mockDbSelect(null);

      const result = await renameSite('nonexistent', 'new-slug', {});
      expect(result).toBeNull();
    });
  });

  describe('createSite', () => {
    it('should insert a new site', async () => {
      const siteData = { slug: 'new-site', partner1Name: 'Alice' } as any;

      const result = await createSite('new-site', siteData);

      expect(result).toEqual(siteData);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getAllSlugs', () => {
    it('should return all slugs ordered', async () => {
      const result = await getAllSlugs();

      expect(result).toEqual(['alpha-wedding', 'beta-wedding']);
    });
  });
});
