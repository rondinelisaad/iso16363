import { test, expect } from '@playwright/test';
import { uniqueEmail, registerAndLogin, createOrg } from '../helpers/auth';

test.describe('Authentication', () => {
  test('registers a new user and creates an org', async ({ page }) => {
    const email = uniqueEmail('auth');
    await registerAndLogin(page, email, 'Test1234!');
    await createOrg(page, `E2E Org ${Date.now()}`);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/ISO 16363 Platform/i)).toBeVisible();
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nonexistent@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page.getByText(/invalid|incorrect|unauthorized/i)).toBeVisible({ timeout: 5_000 });
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
