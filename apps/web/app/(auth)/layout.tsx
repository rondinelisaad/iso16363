export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const featureItems = [
    {
      iconBg: '#E6F1FB',
      iconColor: '#185FA5',
      title: 'Taxonomia ISO 16363 pré-carregada',
      desc: '101 métricas do padrão CCSDS 652.0-M-2 prontas para avaliação.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h18M3 15h18M9 3v18" />
        </svg>
      ),
    },
    {
      iconBg: '#EAF3DE',
      iconColor: '#27500A',
      title: 'Fluxo colaborativo de evidências',
      desc: 'Equipes e auditores trabalham juntos no mesmo dossiê.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
    {
      iconBg: '#FAEEDA',
      iconColor: '#854F0B',
      title: 'Relatório oficial em PDF',
      desc: 'Exporte o dossiê completo com parecer do auditor externo.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div
        style={{
          height: 52,
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Left: wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 26,
              height: 26,
              background: '#185FA5',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>ISO 16363</span>
          <span
            style={{
              background: '#E6F1FB',
              color: '#185FA5',
              border: '0.5px solid #B5D4F4',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 500,
              padding: '1px 5px',
            }}
          >
            v1.0
          </span>
        </div>
      </div>

      {/* Split area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left panel: form */}
        <div
          style={{
            flex: 1,
            padding: '40px 48px',
            background: 'white',
            borderRight: '0.5px solid rgba(0,0,0,0.08)',
          }}
        >
          {children}
        </div>

        {/* Right panel: feature list */}
        <div
          style={{
            width: 340,
            padding: '32px 28px',
            background: '#f8f8f7',
            flexShrink: 0,
          }}
        >
          {/* ISO badge */}
          <span
            style={{
              display: 'inline-block',
              background: '#E6F1FB',
              color: '#185FA5',
              border: '0.5px solid #B5D4F4',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              marginBottom: 12,
            }}
          >
            ISO 16363
          </span>

          {/* Platform title */}
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: '0 0 8px' }}>
            Plataforma de auditoria de repositórios confiáveis
          </p>

          {/* Description */}
          <p style={{ fontSize: 12, color: '#5a5a5a', margin: '0 0 24px', lineHeight: 1.6 }}>
            Gerencie conformidade com o padrão ISO 16363 (CCSDS 652.0-M-2) de forma colaborativa.
          </p>

          {/* Feature items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {featureItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: '#9a9a9a', margin: '2px 0 0', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
