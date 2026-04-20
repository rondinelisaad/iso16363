'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api-client';

interface Notification {
  id: string;
  type: string;
  metricId: string;
  message: string;
  createdAt: string;
}

interface Props {
  token: string;
}

const EVENT_ICON: Record<string, { bg: string; color: string }> = {
  NON_COMPLIANT: { bg: '#FCEBEB', color: '#A32D2D' },
  READY:         { bg: '#EAF3DE', color: '#0F6E56' },
  INVITE:        { bg: '#E6F1FB', color: '#185FA5' },
  RESUBMIT:      { bg: '#FAEEDA', color: '#854F0B' },
};

function getEventStyle(type: string) {
  return EVENT_ICON[type] ?? { bg: '#f5f6f8', color: '#6b7280' };
}

type TabKey = 'all' | 'nc' | 'activity';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'nc', label: 'Não-conformidades' },
  { key: 'activity', label: 'Atividade' },
];

export function NotificationBell({ token }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<Notification[]>('/notifications', token);
      setNotifications(data);
    } catch {
      // silently ignore if endpoint unreachable
    }
  }, [token]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`, {}, token);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllRead() {
    await api.patch('/notifications/read-all', {}, token);
    setNotifications([]);
    setOpen(false);
  }

  const count = notifications.length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'nc') return n.type === 'NON_COMPLIANT';
    if (activeTab === 'activity') return n.type !== 'NON_COMPLIANT';
    return true;
  });

  return (
    <div className="relative">
      {/* Bell button — 30×30px */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'relative',
          width: 30,
          height: 30,
          borderRadius: 'var(--border-radius-md)',
          border: '0.5px solid var(--color-border-secondary)',
          background: 'var(--color-background-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
        aria-label="Notificações"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge — 8×8px */}
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#E24B4A',
              border: '1.5px solid var(--color-background-primary)',
            }}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: -16,
              width: 300,
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              zIndex: 20,
              marginTop: 36,
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Notificações
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Count badge */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '1px 7px',
                    borderRadius: 20,
                    ...(count > 0
                      ? { background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F7C1C1' }
                      : { background: '#EAF3DE', color: '#27500A', border: '0.5px solid #C0DD97' }),
                  }}
                >
                  {count > 0 ? `${count} nova${count > 1 ? 's' : ''}` : 'Em dia'}
                </span>
                {count > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: 11, color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
            </div>

            {/* Filter tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid #185FA5' : '2px solid transparent',
                    color: activeTab === tab.key ? '#185FA5' : '#9a9a9a',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginBottom: -1,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification list */}
            {filteredNotifications.length === 0 ? (
              <p
                style={{
                  padding: '28px 14px',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                Nenhuma notificação
              </p>
            ) : (
              <ul
                style={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {filteredNotifications.map((n) => {
                  const { bg, color } = getEventStyle(n.type);
                  return (
                    <li
                      key={n.id}
                      style={{
                        position: 'relative',
                        padding: '10px 14px 10px 20px',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                        background: '#E6F1FB',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Unread dot */}
                      <span
                        style={{
                          position: 'absolute',
                          left: 5,
                          top: 14,
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#185FA5',
                        }}
                      />

                      {/* Icon */}
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--border-radius-md)',
                          background: bg,
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                          {n.message}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {new Date(n.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={() => markRead(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          padding: 2,
                          flexShrink: 0,
                        }}
                        aria-label="Dispensar"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Footer */}
            <div
              style={{
                padding: '8px 14px',
                borderTop: '0.5px solid var(--color-border-tertiary)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 11, color: '#185FA5', cursor: 'pointer' }}>
                Ver histórico completo ↗
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
