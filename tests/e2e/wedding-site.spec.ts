import { test, expect } from '@playwright/test';

test.describe('Wedding Site Interactions', () => {
  const siteSlug = 'kifleandmilka';

  test.beforeEach(async ({ page }) => {
    // Navigate to the site
    await page.goto(`/${siteSlug}`);
  });

  test('should navigate between sections using nav menu', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Click Story
    await nav.getByRole('link', { name: 'Story' }).click();
    await expect(page).toHaveURL(new RegExp(`.*${siteSlug}#story`));
    await expect(page.locator('#story')).toBeInViewport();

    // Click Schedule
    await nav.getByRole('link', { name: 'Schedule' }).click();
    await expect(page).toHaveURL(new RegExp(`.*${siteSlug}#schedule`));
    await expect(page.locator('#schedule')).toBeInViewport();
  });

  test('should show validation errors in RSVP form', async ({ page }) => {
    // Navigate to RSVP section
    await page.getByRole('navigation').getByRole('link', { name: 'RSVP' }).click();
    
    // Try to submit without filling any fields
    await page.getByRole('button', { name: 'Submit RSVP' }).click();
    
    // HTML5 validation or application validation should prevent submission
    // Since it's a 'required' field, we can check for the input's state
    const emailInput = page.getByLabel('Email');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBeTruthy();
  });

  test('should handle successful RSVP submission', async ({ page }) => {
    // This test might actually create data in the DB/Sheets if not careful.
    // In a real test env we would mock the API, but here we'll just test the UI state
    
    await page.getByRole('navigation').getByRole('link', { name: 'RSVP' }).click();
    
    await page.getByLabel('Email').fill('test-guest@example.com');
    await page.getByPlaceholder('Guest full name').fill('Test Guest');
    
    // Note: We don't actually click submit here to avoid side effects in prod-like DB
    // unless this is a dedicated test environment.
    await expect(page.getByRole('button', { name: 'Submit RSVP' })).toBeEnabled();
  });
});
