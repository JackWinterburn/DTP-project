import { describe, expect, it, vi } from 'vitest';
import { CONSENT_VERSION } from '@/config';

let insertError: { code?: string; message?: string } | null = null;
const insert = vi.fn(() => Promise.resolve({ error: insertError }));
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseClient: () => ({ from: () => ({ insert }) }),
}));

const { POST } = await import('./route');

const VALID_BODY = {
  sessionId: '11111111-1111-1111-1111-111111111111',
  email: 'parent@example.com',
  consentVersion: CONSENT_VERSION,
};

function postOptin(body: unknown) {
  return POST(
    new Request('http://localhost/api/optin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

/**
 * "Test Case 6: double-submit protection" (Section 5.2). There's no
 * separate application-level guard against a double opt-in submit -- the
 * protection IS the database's unique constraint on
 * email_optins.session_id (Phase 6 migration), surfaced here as a 409
 * rather than a generic 500 so a double-tap on "Notify me" (a flaky
 * network retry, or the student tapping twice) reads as "already done",
 * not an error.
 */
describe('POST /api/optin -- double-submit protection (Section 5.2 Test Case 6)', () => {
  it('accepts the first opt-in for a session (201)', async () => {
    insertError = null;
    const response = await postOptin(VALID_BODY);
    expect(response.status).toBe(201);
  });

  it('returns 409 on a second opt-in for the same session (unique constraint violation)', async () => {
    insertError = { code: '23505', message: 'duplicate key value violates unique constraint' };
    const response = await postOptin(VALID_BODY);
    expect(response.status).toBe(409);
  });

  it('returns 400 for an invalid email rather than reaching the database at all', async () => {
    const response = await postOptin({ ...VALID_BODY, email: 'not-an-email' });
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown/malformed sessionId', async () => {
    const response = await postOptin({ ...VALID_BODY, sessionId: 'not-a-uuid' });
    expect(response.status).toBe(404);
  });
});
