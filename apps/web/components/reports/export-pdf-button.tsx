'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { downloadPdf } from '../../lib/api-client';

interface Props {
  orgId: string;
  variant: 'draft' | 'official';
  label?: string;
}

export function ExportPdfButton({ orgId, variant, label }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      await downloadPdf(
        `/reports/${orgId}/pdf?variant=${variant}`,
        session.accessToken,
        `iso16363-${variant}-${orgId}.pdf`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 text-xs font-medium bg-white border border-gray-200 rounded-md hover:border-gray-400 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Generating…' : (label ?? `Export ${variant === 'draft' ? 'Draft' : 'Official'} PDF`)}
    </button>
  );
}
