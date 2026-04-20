import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    return {};
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const { accessToken } = (await res.json()) as { accessToken: string };
          const payload = decodeJwtPayload(accessToken);
          return {
            id: payload.sub as string,
            email: payload.email as string,
            accessToken,
            orgId: (payload.orgId as string | null) ?? null,
            role: (payload.role as string | null) ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.orgId = user.orgId;
        token.role = user.role;
        token.userId = user.id;
      }
      if (trigger === 'update' && (session as { accessToken?: string })?.accessToken) {
        const newToken = (session as { accessToken: string }).accessToken;
        const payload = decodeJwtPayload(newToken);
        token.accessToken = newToken;
        token.orgId = (payload.orgId as string | null) ?? null;
        token.role = (payload.role as string | null) ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.userId as string;
      session.user.orgId = (token.orgId as string | null) ?? null;
      session.user.role = (token.role as string | null) ?? null;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
};
