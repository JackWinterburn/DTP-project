import { describe, expect, it, vi } from 'vitest';

const getResultByShareToken = vi.fn();
vi.mock('@/lib/results/getResultByShareToken', () => ({ getResultByShareToken }));

const { GET } = await import('./route');

/** GET /api/results/{share_token} -- Section 3.6 contract: 404 unknown or expired token (Section 5.2 Test Case 3). */
describe('GET /api/results/[shareToken]', () => {
  it('returns 404 for an unknown or expired token', async () => {
    getResultByShareToken.mockResolvedValueOnce(null);
    const response = await GET(new Request('http://localhost/api/results/does-not-exist'), {
      params: Promise.resolve({ shareToken: 'does-not-exist' }),
    });
    expect(response.status).toBe(404);
  });

  it('returns 200 with the matches/quizVersion/completedAt shape for a known token', async () => {
    getResultByShareToken.mockResolvedValueOnce({
      matches: [{ courseId: 'tlevel-digital', scorePct: 75, reasons: [] }],
      quizVersion: 2,
      completedAt: '2026-09-01T12:00:00.000Z',
    });
    const response = await GET(new Request('http://localhost/api/results/real-token'), {
      params: Promise.resolve({ shareToken: 'real-token' }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      matches: [{ courseId: 'tlevel-digital', scorePct: 75, reasons: [] }],
      quizVersion: 2,
      completedAt: '2026-09-01T12:00:00.000Z',
    });
  });
});
