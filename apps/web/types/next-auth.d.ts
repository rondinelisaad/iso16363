import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    orgId: string | null;
    role: string | null;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      orgId: string | null;
      role: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    userId: string;
    orgId: string | null;
    role: string | null;
  }
}
