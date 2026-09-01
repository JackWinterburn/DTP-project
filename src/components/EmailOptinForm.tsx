'use client';

import { useState } from 'react';
import { CONSENT_VERSION, NOTICE_TEXT } from '@/config';

/**
 * Email opt-in (ticket #25, FR9, NFR3). Restyled 2026-09-01 to match the
 * dark "ada" visual language. Deliberately unbundled from the results
 * reveal (own section, own explicit checkbox, no pre-ticked box) per the
 * legal briefing's marketing-to-minors caution, and only rendered once
 * there's a real sessionId to attach the opt-in to.
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
      <p className="text-ada-grey text-sm" role="status">
        {state === 'done'
          ? "Thanks — we'll send a reminder to that address in a few weeks."
          : "That session's already opted in."}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="border-ada-border bg-ada-card rounded-xl border p-6"
    >
      <p className="text-sm font-bold">Get a reminder by email</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="border-ada-border bg-ada-black text-ada-white placeholder:text-ada-grey focus:border-ada-green mt-2.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
      />
      <label className="text-ada-grey mt-2.5 flex items-start gap-2 text-xs leading-relaxed">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="accent-ada-green mt-0.5"
        />
        <span>{NOTICE_TEXT}</span>
      </label>
      <button
        type="submit"
        disabled={!consented || !email || state === 'loading'}
        className="hover:bg-ada-green-dark bg-ada-green text-ada-black focus-visible:ring-ada-green focus-visible:ring-offset-ada-black mt-3.5 min-h-[44px] w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
      >
        {state === 'loading' ? 'Saving…' : 'Send me a reminder'}
      </button>
      {state === 'error' && (
        <p className="text-ada-grey mt-2 text-xs" role="status">
          Couldn&apos;t save that just now — try again in a moment.
        </p>
      )}
    </form>
  );
}
