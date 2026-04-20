'use client';

import { Suspense, useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '0.5px solid rgba(0,0,0,0.13)',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
  fontFamily: 'inherit',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('E-mail ou senha inválidos');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      {/* Eyebrow */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#9a9a9a',
          margin: '0 0 6px',
        }}
      >
        Acesso à plataforma
      </p>

      {/* Title */}
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px' }}>Entrar</h1>

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: '#5a5a5a', margin: '0 0 24px' }}>
        ISO 16363 Compliance Platform
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5a5a5a', marginBottom: 5 }}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#185FA5';
              e.currentTarget.style.boxShadow = '0 0 0 2px #E6F1FB';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.13)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: '#5a5a5a' }}>
              Senha
            </label>
            <span style={{ fontSize: 11, color: '#185FA5', cursor: 'pointer' }}>
              Esqueceu a senha?
            </span>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#185FA5';
              e.currentTarget.style.boxShadow = '0 0 0 2px #E6F1FB';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.13)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {error && (
          <p
            style={{
              background: '#FCEBEB',
              color: '#791F1F',
              border: '0.5px solid #F09595',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 12,
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#5a93c8' : '#185FA5',
            color: '#E6F1FB',
            border: 'none',
            borderRadius: 6,
            padding: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 12, color: '#9a9a9a' }}>
        Não tem conta?{' '}
        <Link href="/register" style={{ color: '#185FA5', textDecoration: 'none' }}>
          Criar conta →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
