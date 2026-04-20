'use client';

import { useState, useRef } from 'react';
import { Paperclip, ExternalLink, Trash2, Upload } from 'lucide-react';
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
      setError(err instanceof Error ? err.message : 'Upload failed');
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
      alert('Could not generate view URL');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this evidence file?')) return;
    try {
      await api.delete(`/evidence/${id}`, token);
      onUpdate(evidences.filter((e) => e.id !== id));
    } catch {
      alert('Could not delete evidence');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Paperclip size={14} /> Evidence Files
        </h4>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          <Upload size={12} />
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
          {error}
        </p>
      )}

      {evidences.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No evidence attached yet.</p>
      ) : (
        <ul className="space-y-1">
          {evidences.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded border border-gray-100 text-sm"
            >
              <span className="truncate text-gray-700 flex items-center gap-1.5">
                <Paperclip size={12} className="text-gray-400 shrink-0" />
                {ev.fileName}
              </span>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  onClick={() => handleView(ev.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View"
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
