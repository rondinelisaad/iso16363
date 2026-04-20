'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { api } from '../../../lib/api-client';

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

function focusStyle(el: HTMLInputElement) {
  el.style.borderColor = '#185FA5';
  el.style.boxShadow = '0 0 0 2px #E6F1FB';
}

function blurStyle(el: HTMLInputElement) {
  el.style.borderColor = 'rgba(0,0,0,0.13)';
  el.style.boxShadow = 'none';
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Cadastro realizado, mas o login falhou. Tente entrar.');
        router.push('/login');
      } else {
        router.push('/create-org');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro');
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
        Criar conta
      </p>

      {/* Title */}
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1a1a1a', margin: '0 0 24px' }}>
        Cadastrar-se
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5a5a5a', marginBottom: 5 }}>
            Nome
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          />
        </div>

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
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5a5a5a', marginBottom: 5 }}>
            Senha{' '}
            <span style={{ fontWeight: 400, color: '#9a9a9a' }}>(mín. 8 caracteres)</span>
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
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
          {loading ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 12, color: '#9a9a9a' }}>
        Já tem conta?{' '}
        <Link href="/login" style={{ color: '#185FA5', textDecoration: 'none' }}>
          Entrar →
        </Link>
      </p>
    </div>
  );
}
