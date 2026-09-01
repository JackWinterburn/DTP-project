import { NextResponse } from 'next/server';
import { getResultByShareToken } from '@/lib/results/getResultByShareToken';

/**
 * GET /api/results/{share_token} (ticket #19, FR8 read path). Contract
 * fixed by Section 3.6: path param only -> `200 { matches, quizVersion,
 * completedAt }`, `404 unknown or expired token`.
 *
 * `completedAt` is `results.created_at`: the results-insert trigger from
 * the schema migration (mark_session_completed()) sets
 * `quiz_sessions.completed_at` to that exact same timestamp, so this is
 * genuinely "when the quiz was completed", not a proxy for it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await params;
  const result = await getResultByShareToken(shareToken);

  if (!result) {
    return NextResponse.json({ error: 'Unknown or expired token' }, { status: 404 });
  }

  return NextResponse.json({
    matches: result.matches,
    quizVersion: result.quizVersion,
    completedAt: result.completedAt,
  });
}
