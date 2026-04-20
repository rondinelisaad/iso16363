interface SectionData {
  total: number;
  PENDING: number;
  IN_PROGRESS: number;
  READY: number;
}

interface Props {
  sectionId: string;
  title: string;
  data: SectionData;
}

export function SectionProgress({ sectionId, title, data }: Props) {
  const tracked = data.READY + data.IN_PROGRESS + data.PENDING;
  const readyPct = data.total > 0 ? Math.round((data.READY / data.total) * 100) : 0;
  const inProgPct = data.total > 0 ? Math.round((data.IN_PROGRESS / data.total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-gray-400">Section {sectionId}</p>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{readyPct}%</p>
          <p className="text-xs text-gray-400">Ready</p>
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 h-full transition-all"
          style={{ width: `${readyPct}%` }}
        />
        <div
          className="bg-yellow-400 h-full transition-all"
          style={{ width: `${inProgPct}%` }}
        />
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
          {data.READY} ready
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
          {data.IN_PROGRESS} in progress
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-gray-200 mr-1" />
          {data.total - tracked} not started
        </span>
        <span className="ml-auto">{data.total} total</span>
      </div>
    </div>
  );
}
