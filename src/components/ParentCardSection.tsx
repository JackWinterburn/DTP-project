'use client';

import { useState } from 'react';
import type { PersistState } from '@/types/quiz';

interface ParentCardResponse {
  cardText: string;
  source: 'ai' | 'fallback';
}

/**
 * Parent-card generation + WhatsApp share (tickets #21-24, FR6).
 *
 * Gated on `persistState === 'saved'`: POST /api/parent-card looks the
 * result up server-side by shareToken (see the route), so it can only
 * succeed once the result actually exists in the `results` table --
 * generating a card from a client-only, unsaved result would either 404
 * or (worse) silently generate a card for someone else's stale token.
 * Before that, the button explains why it's waiting rather than just
 * being invisible.
 */
export function ParentCardSection({
  shareToken,
  persistState,
}: {
  shareToken: string;
  persistState: PersistState;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [card, setCard] = useState<ParentCardResponse | null>(null);

  async function handleGenerate() {
    setState('loading');
    try {
      const res = await fetch('/api/parent-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken }),
      });
      if (!res.ok) throw new Error(`POST /api/parent-card -> ${res.status}`);
      const data: ParentCardResponse = await res.json();
      setCard(data);
      setState('done');
    } catch (err) {
      console.error('[ParentCardSection] could not generate card', err);
      setState('error');
    }
  }

  if (persistState !== 'saved') {
    return (
      <div className="mt-6 rounded-xl border-2 border-neutral-300 p-4 dark:border-neutral-700">
        <p className="text-sm font-medium">Share with a parent or carer</p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {persistState === 'pending'
            ? 'Available once your results have finished saving.'
            : "Your results couldn't be saved this time, so a parent card isn't available."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border-2 border-neutral-300 p-4 dark:border-neutral-700">
      <p className="text-sm font-medium">Share with a parent or carer</p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Get a short plain-language summary to send over WhatsApp.
      </p>

      {state === 'idle' && (
        <button
          type="button"
          onClick={() => void handleGenerate()}
          className="mt-3 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-100 dark:text-neutral-900"
        >
          Generate summary
        </button>
      )}

      {state === 'loading' && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400" role="status">
          Writing a summary…
        </p>
      )}

      {state === 'error' && (
        <div>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400" role="status">
            Couldn&apos;t generate a summary right now.
          </p>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="mt-2 rounded-md px-2 py-1 text-xs font-medium text-indigo-700 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:text-indigo-400"
          >
            Try again
          </button>
        </div>
      )}

      {state === 'done' && card && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
            {card.cardText}
          </p>
          {card.source === 'fallback' && (
            <p className="text-xs text-neutral-500 italic dark:text-neutral-400">
              This is a standard summary — our AI writer wasn&apos;t available just now.
            </p>
          )}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(card.cardText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Share via WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
