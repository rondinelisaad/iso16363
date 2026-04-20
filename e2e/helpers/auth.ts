import { Page, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://localhost:3001';

export function uniqueEmail(prefix = 'test') {
  return `${prefix}+${Date.now()}@e2e.test`;
}

export async function registerAndLogin(
  page: Page,
  email: string,
  password: string,
  name = 'E2E User',
): Promise<void> {
  await page.goto('/register');
  await page.getByLabel(/name/i).fill(name);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /register/i }).click();
  await expect(page).toHaveURL(/create-org|dashboard/, { timeout: 10_000 });
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).toHaveURL(/create-org|dashboard/, { timeout: 10_000 });
}

export async function createOrg(page: Page, orgName: string): Promise<void> {
  await page.goto('/create-org');
  await page.getByLabel(/organization name/i).fill(orgName);
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
}

export async function getInviteToken(
  managerToken: string,
  orgSlug: string,
  role: string,
  inviteeEmail: string,
): Promise<string> {
  const res = await fetch(`${API}/organizations/${orgSlug}/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ email: inviteeEmail, role }),
  });
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function getManagerToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}
