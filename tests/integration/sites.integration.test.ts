/**
 * @vitest-environment node
 *
 * Integration tests that hit the real Railway dev database.
 * Test data is isolated via unique slugs and cleaned up after each test.
 *
 * Run with: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

const TEST_PREFIX = `__test_${Date.now()}`;
const TEST_SLUG = `${TEST_PREFIX}_site`;

let pool: Pool;
let db: ReturnType<typeof drizzle<typeof schema>>;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL not set — check .env.test');

  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool, { schema });

  // Verify connection
  await pool.query('SELECT 1');
});

afterEach(async () => {
  // Clean up all test data by prefix
  await pool.query(`DELETE FROM site_audit_log WHERE site_slug LIKE $1`, [`${TEST_PREFIX}%`]);
  await pool.query(`DELETE FROM sites WHERE slug LIKE $1`, [`${TEST_PREFIX}%`]);
});

afterAll(async () => {
  await pool.end();
});

describe('Database persistence (integration)', () => {
  it('should INSERT and read back a site', async () => {
    const siteData = { slug: TEST_SLUG, partner1Name: 'Alice', partner2Name: 'Bob' };

    await db.insert(schema.sites).values({ slug: TEST_SLUG, data: siteData });

    const result = await db.query.sites.findFirst({
      where: eq(schema.sites.slug, TEST_SLUG),
    });

    expect(result).not.toBeNull();
    expect((result!.data as any).partner1Name).toBe('Alice');
  });

  it('should UPDATE and verify persistence', async () => {
    const siteData = { slug: TEST_SLUG, partner1Name: 'Alice', partner2Name: 'Bob' };
    await db.insert(schema.sites).values({ slug: TEST_SLUG, data: siteData });

    const updated = { ...siteData, partner1Name: 'Updated Alice' };
    const result = await db.update(schema.sites)
      .set({ data: updated, updatedAt: new Date() })
      .where(eq(schema.sites.slug, TEST_SLUG))
      .returning({ slug: schema.sites.slug });

    expect(result).toHaveLength(1);

    // Read back and verify
    const readBack = await db.query.sites.findFirst({
      where: eq(schema.sites.slug, TEST_SLUG),
    });

    expect((readBack!.data as any).partner1Name).toBe('Updated Alice');
  });

  it('should return 0 rows when updating a non-existent site', async () => {
    const result = await db.update(schema.sites)
      .set({ data: { slug: 'ghost' }, updatedAt: new Date() })
      .where(eq(schema.sites.slug, `${TEST_PREFIX}_nonexistent`))
      .returning({ slug: schema.sites.slug });

    expect(result).toHaveLength(0);
  });

  it('should write audit log entries', async () => {
    await db.insert(schema.siteAuditLog).values({
      siteSlug: TEST_SLUG,
      action: 'update',
      changedFields: ['partner1Name', 'partner2Name'],
    });

    const { rows } = await pool.query(
      `SELECT * FROM site_audit_log WHERE site_slug = $1`,
      [TEST_SLUG]
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].action).toBe('update');
    expect(rows[0].changed_fields).toContain('partner1Name');
  });

  it('should not lose data on rapid sequential updates', async () => {
    const siteData = { slug: TEST_SLUG, partner1Name: 'V1', partner2Name: 'Bob' };
    await db.insert(schema.sites).values({ slug: TEST_SLUG, data: siteData });

    // Simulate rapid saves from dashboard autosave
    for (let i = 2; i <= 5; i++) {
      await db.update(schema.sites)
        .set({ data: { ...siteData, partner1Name: `V${i}` }, updatedAt: new Date() })
        .where(eq(schema.sites.slug, TEST_SLUG));
    }

    const final = await db.query.sites.findFirst({
      where: eq(schema.sites.slug, TEST_SLUG),
    });

    expect((final!.data as any).partner1Name).toBe('V5');
  });
});
