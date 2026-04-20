import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function serverApi<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

export async function getToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.accessToken;
}
