'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  role: string;
  email: string;
  orgId: string;
  ncCount?: number;
}

const roleLabels: Record<string, string> = {
  org_manager: 'Gestor',
  contributor: 'Colaborador',
  internal_auditor: 'Auditor interno',
  external_auditor: 'Auditor externo',
};

function DashboardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function StandardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function GapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}

export function AppNav({ role, email, orgId, ncCount = 0 }: Props) {
  const pathname = usePathname();

  const showGapAnalysis = ['internal_auditor', 'org_manager'].includes(role);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  }

  const navItemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 8px',
    borderRadius: 6,
    fontSize: 12.5,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.1s',
  };

  function navItemStyle(active: boolean): React.CSSProperties {
    return {
      ...navItemBase,
      background: active ? 'white' : 'transparent',
      color: active ? '#185FA5' : '#5a5a5a',
      fontWeight: active ? 500 : 400,
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
    };
  }

  const avatarLetter = email ? email[0].toUpperCase() : '?';
  const displayName = email ?? '';

  return (
    <div
      style={{
        width: 200,
        background: '#f8f8f7',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
      }}
    >
      {/* Brand bar */}
      <div style={{ padding: '14px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 24,
            height: 24,
            background: '#185FA5',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldIcon />
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1a1a' }}>
          ISO 16363
        </span>
      </div>

      {/* Nav section label */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: '#9a9a9a',
          padding: '12px 10px 4px',
          margin: 0,
        }}
      >
        Navegação
      </p>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
        <Link href="/dashboard" style={navItemStyle(isActive('/dashboard'))}>
          <DashboardIcon />
          Dashboard
        </Link>

        <Link href="/standard" style={navItemStyle(isActive('/standard'))}>
          <StandardIcon />
          Padrão
        </Link>

        {showGapAnalysis && (
          <Link href="/gap-analysis" style={{ ...navItemStyle(isActive('/gap-analysis')), justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <GapIcon />
              Gap Analysis
            </span>
            {ncCount > 0 && (
              <span
                style={{
                  background: '#E24B4A',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 500,
                  borderRadius: 10,
                  padding: '1px 5px',
                  minWidth: 16,
                  textAlign: 'center',
                }}
              >
                {ncCount}
              </span>
            )}
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#E6F1FB',
            color: '#185FA5',
            fontSize: 10,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: '#1a1a1a',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </p>
          <p style={{ fontSize: 10, color: '#9a9a9a', margin: 0 }}>
            {roleLabels[role] ?? role}
          </p>
        </div>
      </div>
    </div>
  );
}
