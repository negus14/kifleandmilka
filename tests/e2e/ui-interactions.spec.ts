import { test, expect } from '@playwright/test';

test.describe('Marketing Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have a working navigation menu', async ({ page }) => {
    // Check main links exist
    const nav = page.getByRole('navigation');
    const howItWorksLink = nav.getByRole('link', { name: 'How It Works' });
    const featuresLink = nav.getByRole('link', { name: 'Features' });
    const demoLink = nav.getByRole('link', { name: 'Demo' });
    const loginLink = nav.getByRole('link', { name: 'Log In' });
    const getStartedLink = nav.getByRole('link', { name: 'Get Started' });

    await expect(howItWorksLink).toBeVisible();
    await expect(featuresLink).toBeVisible();
    await expect(demoLink).toBeVisible();
    await expect(loginLink).toBeVisible();
    await expect(getStartedLink).toBeVisible();

    // Test anchor navigation
    await howItWorksLink.click();
    await expect(page).toHaveURL(/.*#how-it-works/);
    
    const howItWorksSection = page.locator('#how-it-works');
    await expect(howItWorksSection).toBeInViewport();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('Login Page Interactions', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Use Site Name as seen in LoginForm.tsx
    await page.getByLabel('Site Name').fill('non-existent-site');
    await page.getByLabel('Password').fill('wrong-password');
    // Button text is "Log In" (case sensitive or exact match might be needed)
    await page.getByRole('button', { name: 'Log In' }).click();

    // Check for error message
    // site-data.test.ts might be returning null for getSiteBySlug('non-existent-site')
    // which results in "Site not found." error from LoginPage.tsx
    await expect(page.getByText(/Site not found|Invalid password/)).toBeVisible();
  });
});
