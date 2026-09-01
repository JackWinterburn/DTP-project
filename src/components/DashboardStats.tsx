import Link from 'next/link';
import type { EngagementStats } from '@/lib/dashboard/getEngagementStats';

/** "—" rather than a misleading 0% when there's no denominator yet (e.g. a poster with zero scans). */
function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-ada-border bg-ada-card rounded-xl border p-4">
      <p className="text-ada-grey text-xs font-bold tracking-[0.1em] uppercase">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

/**
 * Read-only staff dashboard (tickets #27-28, FR10). Purely presentational
 * -- all data comes pre-aggregated from getEngagementStats(), which only
 * ever reads the qr_engagement view (see that file's comment for why this
 * is what makes "aggregates only, no individual results" actually true).
 *
 * Two tables, not one: the "by school" table is the FR10 headline view
 * (what the success-criteria table in the report tracks); the "by
 * poster" table underneath exists because qr_engagement is naturally
 * per-QR-code, and a school can have more than one poster/location --
 * collapsing straight to school-level totals would hide exactly the
 * "which poster location is/isn't working" detail Ada staff would
 * actually want, and each row links to that poster's /staff/qr/{token}
 * page (ticket #20) so staff can jump straight to a reprint.
 */
export function DashboardStats({ stats }: { stats: EngagementStats }) {
  const { rows, schoolSummaries, totals } = stats;

  if (rows.length === 0) {
    return (
      <div className="border-ada-border bg-ada-card rounded-xl border p-6 text-center">
        <p className="font-semibold">No poster activity yet.</p>
        <p className="text-ada-grey mt-1 text-sm">
          Once a school QR code is added (Supabase &gt; Table Editor &gt; qr_codes) and scanned, its
          stats will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Scans" value={totals.scans} />
        <StatCard label="Completions" value={totals.completions} />
        <StatCard label="T-Level top matches" value={totals.tlevelTopMatches} />
      </div>

      <section aria-labelledby="by-school-heading">
        <h2 id="by-school-heading" className="mb-3 text-lg font-bold">
          By school
        </h2>
        <div className="border-ada-border overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Scan, completion and T-Level top-match counts per school, aggregated across all of
              that school&rsquo;s posters.
            </caption>
            <thead className="bg-ada-card text-ada-grey text-xs tracking-[0.05em] uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  School
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Posters
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Scans
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Completions
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Completion rate
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  T-Level top matches
                </th>
              </tr>
            </thead>
            <tbody className="divide-ada-border divide-y">
              {schoolSummaries.map((s) => (
                <tr key={s.school}>
                  <th scope="row" className="px-4 py-3 font-semibold">
                    {s.school}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">{s.posterCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.scans}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.completions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRate(s.completions, s.scans)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.tlevelTopMatches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="by-poster-heading">
        <h2 id="by-poster-heading" className="mb-3 text-lg font-bold">
          By poster
        </h2>
        <div className="border-ada-border overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Scan and completion counts for each individual poster QR code, with a link to reprint
              it.
            </caption>
            <thead className="bg-ada-card text-ada-grey text-xs tracking-[0.05em] uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  School
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Location
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Scans
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Completions
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  T-Level top matches
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  <span className="sr-only">Poster</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-ada-border divide-y">
              {rows.map((r) => (
                <tr key={r.token}>
                  <td className="px-4 py-3">{r.school}</td>
                  <td className="text-ada-grey px-4 py-3">{r.location ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.scans}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.completions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.tlevelTopMatches}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/staff/qr/${encodeURIComponent(r.token)}`}
                      className="text-ada-green hover:underline"
                    >
                      View poster →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
