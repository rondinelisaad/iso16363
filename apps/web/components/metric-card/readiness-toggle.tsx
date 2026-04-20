'use client';

import { ReadinessStatus } from '@iso16363/shared-types';

const LABELS: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'Pending',
  [ReadinessStatus.IN_PROGRESS]: 'In progress',
  [ReadinessStatus.READY]: 'Ready',
};

const INACTIVE: Record<ReadinessStatus, React.CSSProperties> = {
  [ReadinessStatus.PENDING]: {
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border-secondary)',
  },
  [ReadinessStatus.IN_PROGRESS]: {
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border-secondary)',
  },
  [ReadinessStatus.READY]: {
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border-secondary)',
  },
};

const ACTIVE: Record<ReadinessStatus, React.CSSProperties> = {
  [ReadinessStatus.PENDING]: {
    background: '#FAEEDA',
    color: '#854F0B',
    borderColor: '#FAC775',
    fontWeight: 500,
  },
  [ReadinessStatus.IN_PROGRESS]: {
    background: '#E6F1FB',
    color: '#0C447C',
    borderColor: '#B5D4F4',
    fontWeight: 500,
  },
  [ReadinessStatus.READY]: {
    background: '#EAF3DE',
    color: '#27500A',
    borderColor: '#C0DD97',
    fontWeight: 500,
  },
};

const DOT_COLOR: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: '#EF9F27',
  [ReadinessStatus.IN_PROGRESS]: '#378ADD',
  [ReadinessStatus.READY]: '#1D9E75',
};

interface Props {
  value: ReadinessStatus;
  onChange: (v: ReadinessStatus) => void;
  disabled?: boolean;
}

export function ReadinessToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2">
      {Object.values(ReadinessStatus).map((s) => {
        const isActive = value === s;
        return (
          <button
            key={s}
            disabled={disabled}
            onClick={() => onChange(s)}
            style={{
              borderRadius: 20,
              borderWidth: '0.5px',
              borderStyle: 'solid',
              fontSize: 11,
              padding: '3px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              ...(isActive ? ACTIVE[s] : INACTIVE[s]),
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: DOT_COLOR[s],
                flexShrink: 0,
              }}
            />
            {LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
