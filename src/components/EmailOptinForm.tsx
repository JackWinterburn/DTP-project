'use client';

import { useState } from 'react';
import { CONSENT_VERSION, NOTICE_TEXT } from '@/config';

/**
 * Email opt-in (ticket #25, FR9, NFR3). Added alongside the ticket's
 * backend route for the same reason as Phase 5's /r/{token} page --
 * otherwise POST /api/optin has no way to be reached. Deliberately
 * unbundled from the results reveal (own section, own explicit checkbox,
 * no pre-ticked box) per the legal briefing's marketing-to-minors
 * caution, and only rendered once there's a real sessionId to attach the
 * opt-in to.
 */
export function EmailOptinForm({ sessionId }: { sessionId: string | null }) {
  const [email, setEmail] = useState('');
  const [consented, setConsented] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'duplicate' | 'error'>('idle');

  if (!sessionId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consented || !email) return;
    setState('loading');
    try {
      const res = await fetch('/api/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email, consentVersion: CONSENT_VERSION }),
      });
      if (res.status === 409) {
        setState('duplicate');
        return;
      }
      if (!res.ok) throw new Error(`POST /api/optin -> ${res.status}`);
      setState('done');
    } catch (err) {
      console.error('[EmailOptinForm] could not save opt-in', err);
      setState('error');
    }
  }

  if (state === 'done' || state === 'duplicate') {
    return (
      <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400" role="status">
        {state === 'done'
          ? "Thanks — we'll send a reminder to that address in a few weeks."
          : "That session's already opted in."}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mt-6 rounded-xl border-2 border-neutral-300 p-4 dark:border-neutral-700"
    >
      <p className="text-sm font-medium">Get a reminder by email</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="mt-2 w-full rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <label className="mt-2 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5"
        />
        <span>{NOTICE_TEXT}</span>
      </label>
      <button
        type="submit"
        disabled={!consented || !email || state === 'loading'}
        className="mt-3 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {state === 'loading' ? 'Saving…' : 'Send me a reminder'}
      </button>
      {state === 'error' && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400" role="status">
          Couldn&apos;t save that just now — try again in a moment.
        </p>
      )}
    </form>
  );
}
