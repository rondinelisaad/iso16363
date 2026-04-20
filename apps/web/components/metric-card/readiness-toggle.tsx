'use client';

import { ReadinessStatus } from '@iso16363/shared-types';

const LABELS: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'Pending',
  [ReadinessStatus.IN_PROGRESS]: 'In Progress',
  [ReadinessStatus.READY]: 'Ready',
};

const STYLES: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50',
  [ReadinessStatus.IN_PROGRESS]:
    'border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
  [ReadinessStatus.READY]: 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100',
};

const ACTIVE: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'border-gray-500 bg-gray-100 text-gray-800 font-semibold',
  [ReadinessStatus.IN_PROGRESS]: 'border-yellow-500 bg-yellow-100 text-yellow-800 font-semibold',
  [ReadinessStatus.READY]: 'border-green-600 bg-green-100 text-green-800 font-semibold',
};

interface Props {
  value: ReadinessStatus;
  onChange: (v: ReadinessStatus) => void;
  disabled?: boolean;
}

export function ReadinessToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2">
      {Object.values(ReadinessStatus).map((s) => (
        <button
          key={s}
          disabled={disabled}
          onClick={() => onChange(s)}
          className={[
            'px-3 py-1.5 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            value === s ? ACTIVE[s] : STYLES[s],
          ].join(' ')}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  );
}
