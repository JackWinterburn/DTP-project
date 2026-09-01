import { getSupabaseAdminClient } from '@/lib/supabase/server';

export interface QrEngagementRow {
  school: string;
  token: string;
  location: string | null;
  scans: number;
  completions: number;
  tlevelTopMatches: number;
}

export interface SchoolSummary {
  school: string;
  posterCount: number;
  scans: number;
  completions: number;
  tlevelTopMatches: number;
}

export interface EngagementStats {
  rows: QrEngagementRow[];
  schoolSummaries: SchoolSummary[];
  totals: { scans: number; completions: number; tlevelTopMatches: number };
}

/**
 * Staff dashboard data (Phase 7, tickets #26-28, FR10). Reads the
 * `qr_engagement` aggregate view (Architecture doc Section 4) using the
 * admin/service-role client -- this file is the ONLY place in the
 * codebase that should ever call getSupabaseAdminClient(), and it only
 * ever selects from this one pre-aggregated view, never the underlying
 * quiz_sessions/results tables directly. That's what actually makes
 * "read-only, aggregates only, no access to individual results" (FR10,
 * issue #27) true in practice, not just a UI promise: there is no code
 * path here that could accidentally surface a single student's matches.
 *
 * The `dashboard_reader` Postgres role created in the RLS migration is
 * intentionally not used for the live connection here -- it documents
 * the intended least-privilege boundary (select on the view only), but
 * wiring a service-role Supabase client through a `nologin` custom role
 * would need a hand-signed JWT/connection-string setup with no
 * corresponding managed-service benefit for a charity with "low tech-ops
 * comfort" (Architecture doc Section 1). The service-role client plus
 * "only ever query this one view" is the same guarantee, enforced in
 * application code instead of the database session.
 */
export async function getEngagementStats(): Promise<EngagementStats> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('qr_engagement')
    .select('school, token, location, scans, completions, tlevel_top_matches')
    .order('school', { ascending: true });

  if (error) {
    console.error('[getEngagementStats] query failed', error);
    throw new Error('Failed to load dashboard stats');
  }

  const rows: QrEngagementRow[] = (
    (data ?? []) as Array<{
      school: string;
      token: string;
      location: string | null;
      scans: number;
      completions: number;
      tlevel_top_matches: number;
    }>
  ).map((r) => ({
    school: r.school,
    token: r.token,
    location: r.location,
    scans: r.scans,
    completions: r.completions,
    tlevelTopMatches: r.tlevel_top_matches,
  }));

  const bySchool = new Map<string, SchoolSummary>();
  for (const row of rows) {
    const existing = bySchool.get(row.school);
    if (existing) {
      existing.posterCount += 1;
      existing.scans += row.scans;
      existing.completions += row.completions;
      existing.tlevelTopMatches += row.tlevelTopMatches;
    } else {
      bySchool.set(row.school, {
        school: row.school,
        posterCount: 1,
        scans: row.scans,
        completions: row.completions,
        tlevelTopMatches: row.tlevelTopMatches,
      });
    }
  }

  const schoolSummaries = Array.from(bySchool.values()).sort((a, b) =>
    a.school.localeCompare(b.school),
  );

  const totals = rows.reduce(
    (acc, r) => ({
      scans: acc.scans + r.scans,
      completions: acc.completions + r.completions,
      tlevelTopMatches: acc.tlevelTopMatches + r.tlevelTopMatches,
    }),
    { scans: 0, completions: 0, tlevelTopMatches: 0 },
  );

  return { rows, schoolSummaries, totals };
}
