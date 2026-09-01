import { describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseClient: () => ({ rpc }),
}));

const { getResultByShareToken } = await import('./getResultByShareToken');

/**
 * "Test Case 3: invalid/expired share token" (Section 5.2). The share
 * token itself is unguessable (RLS design doc), so there's no separate
 * "malformed token" branch to test -- an unknown OR expired token look
 * identical from here: get_result_by_share_token() just returns no rows.
 */
describe('getResultByShareToken() -- unknown/expired token (Section 5.2 Test Case 3)', () => {
  it('returns null when the RPC finds no matching row', async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });
    const result = await getResultByShareToken('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });

  it('returns null (not a throw) when the RPC itself errors', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'connection reset' } });
    const result = await getResultByShareToken('any-token');
    expect(result).toBeNull();
  });

  it('returns the mapped result when the token resolves', async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          matches: [{ courseId: 'tlevel-digital', scorePct: 90, reasons: [] }],
          quiz_version: 2,
          created_at: '2026-09-01T12:00:00.000Z',
        },
      ],
      error: null,
    });
    const result = await getResultByShareToken('a-real-token');
    expect(result).toEqual({
      matches: [{ courseId: 'tlevel-digital', scorePct: 90, reasons: [] }],
      quizVersion: 2,
      completedAt: '2026-09-01T12:00:00.000Z',
    });
  });
});
