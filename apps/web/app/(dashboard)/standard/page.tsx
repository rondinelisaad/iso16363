import Link from 'next/link';

export default function StandardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">ISO 16363 Standard</h1>
      <p className="text-gray-500 text-sm mb-6">
        CCSDS 652.0-M-2 — Trustworthy Digital Repositories. Select a metric in the sidebar to
        track readiness and attach evidence.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {[
          { id: '3', label: 'Section 3', title: 'Organizational Infrastructure', metrics: 28 },
          { id: '4', label: 'Section 4', title: 'Digital Object Management', metrics: 50 },
          { id: '5', label: 'Section 5', title: 'Infrastructure & Security', metrics: 23 },
        ].map((s) => (
          <Link
            key={s.id}
            href={`/standard/${s.id}`}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <p className="text-xs font-mono text-gray-400 mb-1">{s.label}</p>
            <p className="text-sm font-semibold text-gray-900 mb-2">{s.title}</p>
            <p className="text-xs text-gray-500">{s.metrics} metrics</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
