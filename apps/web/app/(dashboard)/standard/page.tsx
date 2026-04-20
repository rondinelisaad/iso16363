import Link from 'next/link';

export default function StandardPage() {
  return (
    <div style={{ padding: '20px 24px', maxWidth: 640 }}>
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#9a9a9a',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 4px',
          }}
        >
          Padrão
        </p>
        <h1 style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          ISO 16363 — CCSDS 652.0-M-2
        </h1>
        <p style={{ fontSize: 13, color: '#5a5a5a', marginTop: 4 }}>
          Selecione uma métrica na barra lateral para rastrear prontidão e anexar evidências.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { id: '3', code: '3', title: 'Infraestrutura organizacional', metrics: 28 },
          { id: '4', code: '4', title: 'Gestão de objetos digitais', metrics: 50 },
          { id: '5', code: '5', title: 'Gestão de infraestrutura e riscos', metrics: 23 },
        ].map((s) => (
          <Link
            key={s.id}
            href={`/standard/${s.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 6,
                padding: '8px 12px',
                background: 'white',
                cursor: 'pointer',
              }}
              className="hover:bg-[#f5f6f8]"
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#9a9a9a',
                  minWidth: 36,
                  flexShrink: 0,
                }}
              >
                {s.code}
              </span>
              <span style={{ fontSize: 13, color: '#1a1a1a', flex: 1 }}>
                {s.title}
              </span>
              <span style={{ fontSize: 11, color: '#9a9a9a', flexShrink: 0 }}>
                {s.metrics} métricas
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9a9a9a"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
