import { getSupabaseClient } from '@/lib/supabase/server';
import type { CourseMatch } from '@/types/quiz';

export interface StoredResult {
  matches: CourseMatch[];
  quizVersion: number;
  completedAt: string;
}

/**
 * Shared lookup used by both GET /api/results/{token} (ticket #19) and
 * the /r/{token} recall page -- one place calling the
 * get_result_by_share_token() RPC (see the RLS migration) rather than
 * duplicating that call.
 */
export async function getResultByShareToken(shareToken: string): Promise<StoredResult | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_result_by_share_token', {
    p_share_token: shareToken,
  });

  if (error) {
    console.error('[getResultByShareToken] rpc failed', error);
    return null;
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    { matches: CourseMatch[]; quiz_version: number; created_at: string } | undefined;

  if (!row) return null;

  return { matches: row.matches, quizVersion: row.quiz_version, completedAt: row.created_at };
}
