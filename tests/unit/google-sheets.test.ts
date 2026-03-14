/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncRSVPToGoogleSheets } from '@/lib/google-sheets';

// Use vi.hoisted for variables referenced inside vi.mock factories
const { mockAppend, mockMarkSynced } = vi.hoisted(() => ({
  mockAppend: vi.fn(),
  mockMarkSynced: vi.fn(),
}));

// The google mock needs to return the same append function reference
vi.mock('googleapis', () => {
  const sheetsObj = {
    spreadsheets: {
      values: {
        append: mockAppend,
      },
    },
  };
  return {
    google: {
      auth: {
        GoogleAuth: class MockGoogleAuth {
          constructor() {}
        },
      },
      sheets: vi.fn().mockReturnValue(sheetsObj),
    },
  };
});

vi.mock('@/lib/data/rsvps', () => ({
  markRSVPSynced: (...args: any[]) => mockMarkSynced(...args),
}));

describe('syncRSVPToGoogleSheets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@service.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
  });

  it('should return false if no Google Sheet ID configured', async () => {
    const result = await syncRSVPToGoogleSheets(
      { slug: 'test' },
      'test@email.com',
      [{ name: 'John', attending: true }],
      'Hello',
      'rsvp-1'
    );

    expect(result).toBe(false);
    expect(mockAppend).not.toHaveBeenCalled();
  });

  it('should return false if credentials are missing', async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    const result = await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'sheet-123' },
      'test@email.com',
      [{ name: 'John', attending: true }],
      'Hello',
      'rsvp-1'
    );

    expect(result).toBe(false);
  });

  it('should extract sheet ID from rsvpEmbedUrl and sync', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    const result = await syncRSVPToGoogleSheets(
      { slug: 'test', rsvpEmbedUrl: 'https://docs.google.com/spreadsheets/d/abc123xyz/edit' },
      'test@email.com',
      [{ name: 'John', attending: true, mealChoice: 'Chicken', isHalal: true }],
      'Looking forward!',
      'rsvp-1'
    );

    expect(result).toBe(true);
    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'abc123xyz',
        range: "'Sheet1'!A:G",
        valueInputOption: 'RAW',
      })
    );

    const callArgs = mockAppend.mock.calls[0][0];
    const row = callArgs.requestBody.values[0];
    expect(row[1]).toBe('test@email.com');
    expect(row[2]).toBe('John');
    expect(row[3]).toBe('Yes');
    expect(row[4]).toBe('Chicken');
    expect(row[5]).toBe('Yes');
    expect(row[6]).toBe('Looking forward!');
  });

  it('should use googleSheetId as fallback', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'direct-sheet-id' },
      'test@email.com',
      [{ name: 'A', attending: false }],
      undefined,
      'rsvp-2'
    );

    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'direct-sheet-id',
      })
    );
  });

  it('should use custom sheet name if provided', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'id-123', googleSheetName: 'RSVPs' },
      'test@email.com',
      [{ name: 'B', attending: true }],
      undefined,
      'rsvp-3'
    );

    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        range: "'RSVPs'!A:G",
      })
    );
  });

  it('should mark RSVP as synced after successful sync', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'id-123' },
      'test@email.com',
      [{ name: 'C', attending: true }],
      undefined,
      'rsvp-4'
    );

    expect(mockMarkSynced).toHaveBeenCalledWith('rsvp-4');
  });

  it('should handle multiple guests as separate rows', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'id-123' },
      'family@email.com',
      [
        { name: 'Parent', attending: true, mealChoice: 'Beef', isHalal: false },
        { name: 'Child', attending: true, mealChoice: 'Chicken', isHalal: true },
      ],
      'Family RSVP',
      'rsvp-5'
    );

    const callArgs = mockAppend.mock.calls[0][0];
    expect(callArgs.requestBody.values).toHaveLength(2);
    expect(callArgs.requestBody.values[0][2]).toBe('Parent');
    expect(callArgs.requestBody.values[1][2]).toBe('Child');
  });

  it('should return false and not throw on API error', async () => {
    mockAppend.mockRejectedValueOnce(new Error('API Error'));

    const result = await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'id-123' },
      'test@email.com',
      [{ name: 'D', attending: true }],
      undefined,
      'rsvp-6'
    );

    expect(result).toBe(false);
    expect(mockMarkSynced).not.toHaveBeenCalled();
  });

  it('should handle missing guest fields gracefully', async () => {
    mockAppend.mockResolvedValueOnce({});
    mockMarkSynced.mockResolvedValueOnce(undefined);

    await syncRSVPToGoogleSheets(
      { slug: 'test', googleSheetId: 'id-123' },
      '',
      [{ name: '', attending: false }],
      undefined,
      'rsvp-7'
    );

    const callArgs = mockAppend.mock.calls[0][0];
    const row = callArgs.requestBody.values[0];
    expect(row[1]).toBe(''); // empty email
    expect(row[2]).toBe('Unknown'); // fallback name
    expect(row[3]).toBe('No'); // not attending
    expect(row[4]).toBe('None'); // no meal
    expect(row[5]).toBe('No'); // not halal
    expect(row[6]).toBe(''); // no message
  });
});
