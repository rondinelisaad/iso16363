import { ConformanceStatus } from '@iso16363/shared-types';

const CONFIG: Record<ConformanceStatus, { label: string; classes: string }> = {
  [ConformanceStatus.COMPLIANT]: {
    label: 'Compliant',
    classes: 'bg-green-100 text-green-800 border border-green-200',
  },
  [ConformanceStatus.NON_COMPLIANT]: {
    label: 'Non-Compliant',
    classes: 'bg-red-100 text-red-800 border border-red-200',
  },
  [ConformanceStatus.PARTIAL]: {
    label: 'Partial',
    classes: 'bg-orange-100 text-orange-800 border border-orange-200',
  },
  [ConformanceStatus.OBSERVATION]: {
    label: 'Observation',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
};

interface Props {
  status: ConformanceStatus;
}

export function ConformanceBadge({ status }: Props) {
  const { label, classes } = CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
