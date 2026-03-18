/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRSVP, getRSVPsBySite, markRSVPSynced, getUnsyncedRSVPs } from '@/lib/data/rsvps';
import { db } from '@/lib/db';

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    query: {
      rsvps: {
        findMany: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  rsvps: {
    siteId: 'site_id',
    syncedAt: 'synced_at',
    createdAt: 'created_at',
    id: 'id',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  isNull: vi.fn((a) => ({ type: 'isNull', field: a })),
  and: vi.fn((...args) => ({ type: 'and', conditions: args })),
  count: vi.fn(),
}));

// Mock getSiteIdBySlug
vi.mock('@/lib/data/sites', () => ({
  getSiteIdBySlug: vi.fn().mockResolvedValue('uuid-site-1'),
}));

describe('rsvps data layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply default mock for getSiteIdBySlug after clearAllMocks
    const { getSiteIdBySlug } = require('@/lib/data/sites');
    vi.mocked(getSiteIdBySlug).mockResolvedValue('uuid-site-1');
  });

  describe('createRSVP', () => {
    it('should insert an RSVP and return mapped record', async () => {
      const mockRow = {
        id: 'uuid-123',
        siteId: 'uuid-site-1',
        email: 'john@example.com',
        phone: null,
        message: 'Excited!',
        guests: [{ name: 'John', attending: true }],
        confirmationSent: false,
        syncedAt: null,
        createdAt: new Date('2024-01-01'),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockRow]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const result = await createRSVP(
        'test-site',
        'john@example.com',
        [{ name: 'John', attending: true }],
        'Excited!'
      );

      expect(result).toEqual({
        id: 'uuid-123',
        site_id: 'uuid-site-1',
        email: 'john@example.com',
        phone: null,
        message: 'Excited!',
        guests: [{ name: 'John', attending: true }],
        confirmation_sent: false,
        synced_at: null,
        created_at: new Date('2024-01-01'),
      });
    });
  });

  describe('getRSVPsBySite', () => {
    it('should return mapped RSVP records for a site', async () => {
      const mockRows = [
        {
          id: 'r1',
          siteId: 'uuid-site-1',
          email: 'a@b.com',
          phone: null,
          message: null,
          guests: [{ name: 'A', attending: true }],
          confirmationSent: false,
          syncedAt: null,
          createdAt: new Date('2024-01-01'),
        },
      ];

      vi.mocked(db.query.rsvps.findMany).mockResolvedValueOnce(mockRows as any);

      const result = await getRSVPsBySite('test-site');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('r1');
      expect(result[0].site_id).toBe('uuid-site-1');
      expect(result[0].email).toBe('a@b.com');
    });

    it('should return empty array when no RSVPs found', async () => {
      vi.mocked(db.query.rsvps.findMany).mockResolvedValueOnce([]);

      const result = await getRSVPsBySite('empty-site');
      expect(result).toEqual([]);
    });
  });

  describe('markRSVPSynced', () => {
    it('should update the synced_at timestamp', async () => {
      const mockWhere = vi.fn().mockResolvedValue({});
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      await markRSVPSynced('rsvp-123');

      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ syncedAt: expect.any(Date) });
    });
  });

  describe('getUnsyncedRSVPs', () => {
    it('should return only unsynced RSVPs for a slug', async () => {
      const mockRows = [
        {
          id: 'r1',
          siteId: 'uuid-site-1',
          email: 'x@y.com',
          phone: null,
          message: null,
          guests: [{ name: 'X', attending: true }],
          confirmationSent: false,
          syncedAt: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.query.rsvps.findMany).mockResolvedValueOnce(mockRows as any);

      const result = await getUnsyncedRSVPs('test-site');

      expect(result).toHaveLength(1);
      expect(result[0].synced_at).toBeNull();
    });
  });
});
