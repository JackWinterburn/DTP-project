import { describe, expect, it, vi } from 'vitest';

function makeSupabaseMock({
  qrLookupResult = null as { id: string } | null,
  insertError = null as { code?: string; message?: string } | null,
} = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'qr_codes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: qrLookupResult }),
              }),
            }),
          }),
        };
      }
      if (table === 'quiz_sessions') {
        return { insert: () => Promise.resolve({ error: insertError }) };
      }
      throw new Error(`Unexpected table in test: ${table}`);
    }),
  };
}

let supabaseMock = makeSupabaseMock();
vi.mock('@/lib/supabase/server', () => ({ getSupabaseClient: () => supabaseMock }));

const { POST } = await import('./route');

function postSessions(body: unknown) {
  return POST(
    new Request('http://localhost/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

/**
 * "Test Case 4: unknown QR token -- organic visit still works" (Section
 * 5.2). FR1 requires the quiz to keep working even when a poster's token
 * is stale/mistyped/removed -- this is deliberately NOT a 404 (see the
 * route's own comment), it degrades to qr_code_id = null.
 */
describe('POST /api/sessions -- unknown QR token (Section 5.2 Test Case 4)', () => {
  it('still creates a session (201) when the qrToken matches no active code', async () => {
    supabaseMock = makeSupabaseMock({ qrLookupResult: null });
    const response = await postSessions({
      qrToken: 'removed-or-mistyped-token',
      deviceClass: 'mobile',
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('sessionId');
    expect(body).toHaveProperty('quizVersion');
  });

  it('creates a session with no qrToken at all (organic, non-QR visit)', async () => {
    supabaseMock = makeSupabaseMock({ qrLookupResult: null });
    const response = await postSessions({ deviceClass: 'desktop' });
    expect(response.status).toBe(201);
  });

  it('still resolves and uses a real, active qr_code_id when the token is valid', async () => {
    supabaseMock = makeSupabaseMock({ qrLookupResult: { id: 'a-real-qr-code-id' } });
    const response = await postSessions({ qrToken: 'a-real-poster-token', deviceClass: 'mobile' });
    expect(response.status).toBe(201);
  });

  it('rejects an invalid deviceClass with 400 (the only documented error, Section 3.6)', async () => {
    const response = await postSessions({ deviceClass: 'tablet' });
    expect(response.status).toBe(400);
  });
});
