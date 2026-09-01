'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Result } from '@/types/quiz';
import { ResultsScreen } from './ResultsScreen';

type LoadState = 'loading' | 'found' | 'not-found';

/**
 * Client side of the /r/{shareToken} recall page (FR8: "recoverable
 * without an account or login"). Not one of the 4 named Phase 5 tickets
 * (#17-20) -- added alongside them because FR8 and the API design table
 * (Section 3.6) both specifically describe this read path, and a
 * shareToken with nowhere to resolve to isn't actually persistence
 * delivered to a student, just a backend detail. Reuses ResultsScreen
 * rather than duplicating the match-rendering markup.
 */
export function SharedResultView({ shareToken }: { shareToken: string }) {
  const [state, setState] = useState<LoadState>('loading');
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/results/${encodeURIComponent(shareToken)}`);
        if (res.status === 404) {
          if (!cancelled) setState('not-found');
          return;
        }
        if (!res.ok) throw new Error(`GET /api/results/${shareToken} -> ${res.status}`);
        const data: { matches: Result['matches']; quizVersion: number } = await res.json();
        if (!cancelled) {
          setResult({ shareToken, quizVersion: data.quizVersion, matches: data.matches });
          setState('found');
        }
      } catch (err) {
        console.error('[SharedResultView] lookup failed', err);
        if (!cancelled) setState('not-found');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  if (state === 'loading') {
    return (
      <p className="p-6 text-center text-neutral-500 dark:text-neutral-400" role="status">
        Loading your results…
      </p>
    );
  }

  if (state === 'not-found') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">We couldn&apos;t find that result</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          This link may be wrong, or the result may no longer be available.
        </p>
        <button
          type="button"
          onClick={() => router.push('/q')}
          className="rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-100 dark:text-neutral-900"
        >
          Take the quiz
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      {result && (
        <ResultsScreen
          result={result}
          persistState="saved"
          sessionId={null}
          onRestart={() => router.push('/q')}
        />
      )}
    </div>
  );
}
