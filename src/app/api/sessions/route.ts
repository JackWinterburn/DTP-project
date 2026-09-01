import { NextResponse } from 'next/server';
import { QUIZ_VERSION } from '@/config';
import { getSupabaseClient } from '@/lib/supabase/server';

const DEVICE_CLASSES = ['mobile', 'desktop'] as const;
type DeviceClass = (typeof DEVICE_CLASSES)[number];

function isDeviceClass(value: unknown): value is DeviceClass {
  return typeof value === 'string' && (DEVICE_CLASSES as readonly string[]).includes(value);
}

/**
 * POST /api/sessions (ticket #17, FR1 + FR8). Request/response shape is
 * fixed by Section 3.6 of the report: `{ qrToken?, deviceClass }` ->
 * `201 { sessionId, quizVersion }`, `400 invalid deviceClass` as the only
 * documented error.
 *
 * `sessionId` is generated here (crypto.randomUUID()) rather than left to
 * Postgres's column default, specifically so it can be returned without
 * a follow-up SELECT -- the RLS migration gives anon INSERT-only on
 * quiz_sessions, no SELECT grant at all, so `.insert().select()` would
 * fail on the missing table privilege (a separate thing from the RLS
 * policy itself). Same pattern used in POST /api/results.
 *
 * An unresolvable/inactive qrToken is deliberately NOT an error -- there
 * is no 404 in the documented contract, and FR1 requires the quiz to
 * keep working for an organic visit. A removed or mistyped poster token
 * degrades to qr_code_id = null rather than failing the request, which
 * also matches Risk R5 ("QR attribution is directional, not
 * billing-grade").
 */
export async function POST(request: Request) {
  let body: { qrToken?: unknown; deviceClass?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  if (!isDeviceClass(body.deviceClass)) {
    return NextResponse.json(
      { error: `deviceClass must be one of: ${DEVICE_CLASSES.join(', ')}` },
      { status: 400 },
    );
  }

  const supabase = getSupabaseClient();

  let qrCodeId: string | null = null;
  if (typeof body.qrToken === 'string' && body.qrToken.length > 0) {
    const { data } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('token', body.qrToken)
      .eq('active', true)
      .maybeSingle();
    qrCodeId = (data as { id: string } | null)?.id ?? null;
  }

  const sessionId = globalThis.crypto.randomUUID();
  const { error } = await supabase.from('quiz_sessions').insert({
    id: sessionId,
    qr_code_id: qrCodeId,
    device_class: body.deviceClass,
  });

  if (error) {
    console.error('[POST /api/sessions] insert failed', error);
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }

  return NextResponse.json({ sessionId, quizVersion: QUIZ_VERSION }, { status: 201 });
}
