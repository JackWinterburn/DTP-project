import { NextResponse } from 'next/server';
import { CONSENT_VERSION } from '@/config';
import { getSupabaseClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Deliberately simple format check -- this is a UX guard, not a
// deliverability guarantee. Real verification is out of scope (no
// verification email step in the FR/NFR list).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/optin (ticket #25, FR9, NFR3). Contract fixed by Section 3.6:
 * `{ sessionId, email, consentVersion }` -> `201 {}`,
 * `400 invalid email`, `409 already opted in`.
 *
 * `consentVersion` is accepted from the client (rather than always
 * stamping the server's current CONSENT_VERSION) so what's recorded is
 * genuinely "the wording the student saw and agreed to" even if the
 * client is briefly on an older build during a rollout -- but it must
 * match a version this server actually knows about, so a client can't
 * record consent to text the school's DPO has never reviewed. Right now
 * there's only ever one live version, so this mostly guards against a
 * malformed/blank field.
 */
export async function POST(request: Request) {
  let body: { sessionId?: unknown; email?: unknown; consentVersion?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  if (typeof body.sessionId !== 'string' || !UUID_RE.test(body.sessionId)) {
    return NextResponse.json({ error: 'Unknown sessionId' }, { status: 404 });
  }
  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (body.consentVersion !== CONSENT_VERSION) {
    return NextResponse.json({ error: 'Invalid or outdated consent version' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('email_optins').insert({
    session_id: body.sessionId,
    email: body.email,
    consent_version: body.consentVersion,
  });

  if (!error) {
    return NextResponse.json({}, { status: 201 });
  }

  if (error.code === '23505') {
    // Unique violation on session_id -- already opted in for this session.
    return NextResponse.json({ error: 'Already opted in' }, { status: 409 });
  }
  if (error.code === '23503') {
    // FK violation: sessionId doesn't reference a real row. Not in the
    // documented contract, so treated defensively as a 400 rather than
    // inventing a new status code.
    return NextResponse.json({ error: 'Unknown sessionId' }, { status: 400 });
  }

  console.error('[POST /api/optin] insert failed', error);
  return NextResponse.json({ error: 'Could not save opt-in' }, { status: 500 });
}
