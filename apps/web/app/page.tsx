export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            ISO 16363 Compliance Platform
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Trustworthy Digital Repositories — CCSDS 652.0-M-2
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold">Section 3</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Organizational Infrastructure
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold">Section 4</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Digital Object Management
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold">Section 5</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Infrastructure &amp; Security Risk Management
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          M1 Foundation complete — database, seed data, and scaffolding ready.
        </p>
      </div>
    </main>
  );
}
