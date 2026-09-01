import { NextResponse } from 'next/server';
import { QUIZ_VERSION } from '@/config';
import { getSupabaseClient } from '@/lib/supabase/server';
import type { CourseMatch } from '@/types/quiz';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidMatches(value: unknown): value is CourseMatch[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((m) => {
      if (!m || typeof m !== 'object') return false;
      const match = m as Record<string, unknown>;
      return (
        typeof match.courseId === 'string' &&
        typeof match.scorePct === 'number' &&
        match.scorePct >= 0 &&
        match.scorePct <= 100 &&
        Array.isArray(match.reasons) &&
        match.reasons.every((r) => typeof r === 'string')
      );
    })
  );
}

/**
 * POST /api/results (ticket #18, FR8). Contract fixed by Section 3.6:
 * `{ sessionId, matches }` -> `201 { shareToken }`,
 * `404 unknown sessionId` / `422 malformed matches`.
 *
 * The share token is minted here, server-side, on every successful
 * insert -- NOT whatever ScoringEngine.score() generated client-side in
 * Phase 3. That client-side token only fills out the in-memory Result
 * shape to match the UML class diagram; this is the real, persisted,
 * shareable one, and it's what the API contract's `201 { shareToken }`
 * actually means. `results.share_token` is UNIQUE, so a collision is
 * retried once with a fresh token rather than failing the whole request
 * (Section 4.4 edge-case handling) -- vanishingly unlikely at this scale,
 * but free to handle correctly.
 */
export async function POST(request: Request) {
  let body: { sessionId?: unknown; matches?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  if (typeof body.sessionId !== 'string' || !UUID_RE.test(body.sessionId)) {
    return NextResponse.json({ error: 'Unknown sessionId' }, { status: 404 });
  }
  if (!isValidMatches(body.matches)) {
    return NextResponse.json({ error: 'Malformed matches' }, { status: 422 });
  }

  const supabase = getSupabaseClient();
  const sessionId = body.sessionId;
  const matches = body.matches;

  for (let attempt = 0; attempt < 2; attempt++) {
    const shareToken = globalThis.crypto.randomUUID();
    const { error } = await supabase.from('results').insert({
      share_token: shareToken,
      session_id: sessionId,
      quiz_version: QUIZ_VERSION,
      matches,
    });

    if (!error) {
      return NextResponse.json({ shareToken }, { status: 201 });
    }

    if (error.code === '23503') {
      // Foreign key violation: session_id doesn't reference a real row.
      return NextResponse.json({ error: 'Unknown sessionId' }, { status: 404 });
    }
    if (error.code === '23505' && attempt === 0) {
      continue; // Unique violation on share_token -- retry with a fresh one.
    }

    console.error('[POST /api/results] insert failed', error);
    return NextResponse.json({ error: 'Could not save result' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Could not save result' }, { status: 500 });
}
