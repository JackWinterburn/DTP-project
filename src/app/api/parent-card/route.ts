import { NextResponse } from 'next/server';
import { getResultByShareToken } from '@/lib/results/getResultByShareToken';
import { getSupabaseClient } from '@/lib/supabase/server';
import { generateParentCard } from '@/lib/ai/generateParentCard';

/**
 * POST /api/parent-card (tickets #21-23, FR6). Contract fixed by
 * Section 3.6: `{ shareToken }` -> `200 { cardText, source }`,
 * `404 unknown token`.
 *
 * Deliberately always 200 once the token resolves -- an AI failure or a
 * validation failure is not an error condition for this endpoint, it's
 * the `source: "fallback"` path (NFR6: "AI/validation failure degrades
 * to a 200 fallback, never a hard error"). generateParentCard() already
 * guarantees this; this route just has to not add a new failure mode of
 * its own, which is why the mark_card_generated audit call below is
 * fire-and-forget rather than something that can fail the response --
 * it's an audit trail (Architecture doc), not something the client's
 * result depends on.
 */
export async function POST(request: Request) {
  let body: { shareToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  if (typeof body.shareToken !== 'string' || body.shareToken.length === 0) {
    return NextResponse.json({ error: 'Unknown or expired token' }, { status: 404 });
  }
  const shareToken = body.shareToken;

  const result = await getResultByShareToken(shareToken);
  if (!result) {
    return NextResponse.json({ error: 'Unknown or expired token' }, { status: 404 });
  }

  const { cardText, source } = await generateParentCard(result.matches);

  // Audit-only: record that a card was generated for this result, without
  // storing the card text (see the Phase 6 migration). Never lets a DB
  // hiccup here turn a successful card generation into a client-facing
  // error -- log and continue.
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('mark_card_generated', { p_share_token: shareToken });
    if (error) {
      console.error('[POST /api/parent-card] mark_card_generated failed', error);
    }
  } catch (err) {
    console.error('[POST /api/parent-card] mark_card_generated threw', err);
  }

  return NextResponse.json({ cardText, source });
}
