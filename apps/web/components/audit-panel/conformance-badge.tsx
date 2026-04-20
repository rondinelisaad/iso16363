import { ConformanceStatus } from '@iso16363/shared-types';

const CONFIG: Record<ConformanceStatus, { label: string; bg: string; color: string; border: string }> = {
  [ConformanceStatus.COMPLIANT]: {
    label: 'Conforme',
    bg: '#EAF3DE',
    color: '#27500A',
    border: '#C0DD97',
  },
  [ConformanceStatus.NON_COMPLIANT]: {
    label: 'Não conforme',
    bg: '#FCEBEB',
    color: '#791F1F',
    border: '#F09595',
  },
  [ConformanceStatus.PARTIAL]: {
    label: 'Parcialmente conforme',
    bg: '#FAEEDA',
    color: '#633806',
    border: '#FAC775',
  },
  [ConformanceStatus.OBSERVATION]: {
    label: 'Observação',
    bg: '#E6F1FB',
    color: '#0C447C',
    border: '#B5D4F4',
  },
};

interface Props {
  status: ConformanceStatus;
}

export function ConformanceBadge({ status }: Props) {
  const { label, bg, color, border } = CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color,
        border: `0.5px solid ${border}`,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 7px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
