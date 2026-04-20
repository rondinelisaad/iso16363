'use client';

import { useState, useRef } from 'react';
import { api } from '../../lib/api-client';

interface Evidence {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface Props {
  metricId: string;
  evidences: Evidence[];
  token: string;
  onUpdate: (evidences: Evidence[]) => void;
}

export function EvidenceList({ metricId, evidences, token, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { uploadUrl, s3Key } = await api.post<{ uploadUrl: string; s3Key: string }>(
        '/evidence/upload-url',
        { metricId, fileName: file.name, contentType: file.type || 'application/octet-stream' },
        token,
      );
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });
      const evidence = await api.post<Evidence>(
        '/evidence/record',
        { metricId, s3Key, fileName: file.name },
        token,
      );
      onUpdate([evidence, ...evidences]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleView(id: string) {
    try {
      const { url } = await api.get<{ url: string }>(`/evidence/${id}/view-url`, token);
      window.open(url, '_blank');
    } catch {
      alert('Não foi possível gerar o URL de visualização');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este arquivo de evidência?')) return;
    try {
      await api.delete(`/evidence/${id}`, token);
      onUpdate(evidences.filter((e) => e.id !== id));
    } catch {
      alert('Não foi possível excluir a evidência');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Evidências {evidences.length > 0 && `(${evidences.length})`}
        </h4>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 500,
            color: '#185FA5',
            background: '#E6F1FB',
            border: '0.5px solid #B5D4F4',
            borderRadius: 'var(--border-radius-md)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.5 : 1,
          }}
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'Enviando…' : 'Enviar arquivo'}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {error && (
        <p
          style={{
            fontSize: 11,
            color: '#791F1F',
            background: '#FCEBEB',
            border: '0.5px solid #F09595',
            borderRadius: 'var(--border-radius-md)',
            padding: '4px 8px',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {evidences.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          Nenhuma evidência anexada ainda.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {evidences.map((ev) => (
            <li
              key={ev.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                background: 'var(--color-background-secondary)',
                borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              {/* File icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--border-radius-md)',
                    background: '#E6F1FB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="13" height="13" fill="none" stroke="#185FA5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ev.fileName}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                <button
                  onClick={() => handleView(ev.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#185FA5',
                    background: '#E6F1FB',
                    border: '0.5px solid #B5D4F4',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Visualizar
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  style={{
                    padding: 4,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                  }}
                  title="Remover"
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
