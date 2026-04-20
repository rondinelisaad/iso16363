import { test, expect, Browser, BrowserContext } from '@playwright/test';
import {
  uniqueEmail,
  registerAndLogin,
  createOrg,
  login,
  getManagerToken,
  getInviteToken,
} from '../helpers/auth';

const PASSWORD = 'Test1234!';

test.describe('Full audit cycle', () => {
  let managerEmail: string;
  let auditorEmail: string;
  let orgName: string;
  let orgSlug: string;

  // Each test in this suite shares state via the variables above; run serially.
  test.describe.configure({ mode: 'serial' });

  test('01 — manager registers and creates an org', async ({ page }) => {
    managerEmail = uniqueEmail('mgr');
    orgName = `E2E Audit ${Date.now()}`;

    await registerAndLogin(page, managerEmail, PASSWORD);
    await createOrg(page, orgName);

    // Derive slug from org name (same logic as the create-org page)
    orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
  });

  test('02 — manager navigates to a metric and marks it READY', async ({ page }) => {
    await login(page, managerEmail, PASSWORD);
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to the ISO standard
    await page.getByRole('link', { name: /Standard/i }).click();
    await expect(page).toHaveURL(/standard/);

    // Enter Section 3
    await page.getByText(/Organizational Infrastructure/i).first().click();

    // Enter first subsection
    await page.locator('li a').first().click();

    // Enter first metric
    await page.locator('li a').first().click();

    // Wait for MetricCard to load
    await expect(page.getByText(/Normative Requirement/i)).toBeVisible({ timeout: 8_000 });

    // Click READY
    await page.getByRole('button', { name: 'READY' }).click();
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 5_000 });
  });

  test('03 — manager invites an external auditor', async ({ page, browser }) => {
    auditorEmail = uniqueEmail('auditor');

    // Get manager access token via API to generate invite
    const managerToken = await getManagerToken(managerEmail, PASSWORD);
    const inviteToken = await getInviteToken(managerToken, orgSlug, 'external_auditor', auditorEmail);

    // Register auditor in a fresh context
    const auditorCtx = await browser.newContext();
    const auditorPage = await auditorCtx.newPage();

    await auditorPage.goto('/register');
    await auditorPage.getByLabel(/name/i).fill('Auditor User');
    await auditorPage.getByLabel(/email/i).fill(auditorEmail);
    await auditorPage.getByLabel(/password/i).fill(PASSWORD);
    await auditorPage.getByRole('button', { name: /register/i }).click();
    await expect(auditorPage).toHaveURL(/create-org|dashboard/, { timeout: 8_000 });

    // Accept the invite
    await auditorPage.goto(`/accept-invite?token=${inviteToken}`);
    await expect(auditorPage).toHaveURL(/dashboard/, { timeout: 8_000 });

    await auditorCtx.close();
  });

  test('04 — external auditor reviews the dossier and marks NON_COMPLIANT', async ({ browser }) => {
    const auditorCtx = await browser.newContext();
    const page = await auditorCtx.newPage();

    await login(page, auditorEmail, PASSWORD);
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to audit view
    await page.getByRole('link', { name: /Auditor View/i }).click();
    await expect(page).toHaveURL(/audit/);

    // Expand first visible metric row
    const firstMetricButton = page.locator('ul li button').first();
    await firstMetricButton.click();

    // Select NON_COMPLIANT opinion
    await page.getByRole('button', { name: /Non-Compliant/i }).click();

    // Add a comment
    await page.getByPlaceholder(/Add a comment/i).fill('Missing mandatory documentation.');

    // Save
    await page.getByRole('button', { name: /Save Opinion/i }).click();
    await expect(page.getByText(/Saved/i)).toBeVisible({ timeout: 5_000 });

    await auditorCtx.close();
  });

  test('05 — manager sees notification for non-conformance', async ({ page }) => {
    await login(page, managerEmail, PASSWORD);
    await expect(page).toHaveURL(/dashboard/);

    // Notification bell should show a count
    const bell = page.locator('button[aria-label="Notifications"]');
    await expect(bell.locator('span')).toBeVisible({ timeout: 5_000 });
  });

  test('06 — manager exports PDF report', async ({ page }) => {
    await login(page, managerEmail, PASSWORD);
    await page.goto('/gap-analysis');
    await expect(page.getByText(/Gap Analysis/i)).toBeVisible({ timeout: 8_000 });

    // Intercept the download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export Draft PDF/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
