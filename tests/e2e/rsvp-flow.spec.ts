import { test, expect } from '@playwright/test';

test.describe('RSVP Flow', () => {
  test('should navigate to home page', async ({ page }) => {
    // We expect a marketing page or error if no site is provided
    // For now, let's just make sure the app boots up and responds
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});
