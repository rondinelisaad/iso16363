'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api-client';

function AcceptInviteContent() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`);
      return;
    }
    if (status !== 'authenticated' || !token || state !== 'idle') return;

    setState('loading');
    api
      .post<{ accessToken: string }>('/auth/accept-invite', { token }, session!.accessToken)
      .then(async ({ accessToken }) => {
        await update({ accessToken });
        setState('done');
        setTimeout(() => router.push('/dashboard'), 1500);
      })
      .catch((err: Error) => {
        setMessage(err.message);
        setState('error');
      });
  }, [status, token, state, session, update, router]);

  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-red-600">No invite token found in URL.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      {state === 'loading' && <p className="text-gray-600">Accepting invitation…</p>}
      {state === 'done' && (
        <p className="text-green-600 font-medium">Joined! Redirecting to dashboard…</p>
      )}
      {state === 'error' && (
        <p className="text-red-600">
          Failed to accept invite: {message || 'Invalid or expired token.'}
        </p>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteContent />
    </Suspense>
  );
}
