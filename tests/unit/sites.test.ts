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

// Helper to build a chainable select mock
function mockSelectChain(result: any) {
  return vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(result ? [result] : []),
    })),
  }));
}

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockResolvedValue([]),
      })),
    })),
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
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should fetch from DB and populate cache if Redis is empty', async () => {
      const mockSiteData = { partner1Name: 'Alice' };
      vi.mocked(redis.get).mockResolvedValueOnce(null);

      // Mock the select chain for DB query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            data: mockSiteData,
            isPaid: null,
            stripeCustomerId: null,
            customDomain: null,
          }]),
        }),
      } as any);

      const result = await getSiteBySlug('test-site');

      expect(result).toEqual(expect.objectContaining(mockSiteData));
      expect(db.select).toHaveBeenCalled();
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

      // 1st getSiteBySlug call (forceRefresh for existing)
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{
              data: mockSiteData,
              isPaid: null,
              stripeCustomerId: null,
              customDomain: null,
            }]),
          }),
        } as any)
        // 2nd getSiteBySlug call (post-update verification)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{
              data: { ...mockSiteData, partner1Name: 'Bob' },
              isPaid: null,
              stripeCustomerId: null,
              customDomain: null,
            }]),
          }),
        } as any);

      await updateSite('test-site', { partner1Name: 'Bob' });

      expect(redis.del).toHaveBeenCalledWith('site:test-site');
    });
  });
});
