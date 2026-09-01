'use client';

import { useState } from 'react';
import { COURSES } from '@/config';
import type { CourseMatch, PersistState } from '@/types/quiz';

interface ParentCardResponse {
  cardText: string;
  source: 'ai' | 'fallback';
}

const OPEN_DAYS_URL = 'https://www.ada.ac.uk/sixth-form/open-days-events/';

/**
 * "Show this to your parents" teaser + parent summary modal (tickets
 * #21-24, FR6, FR7). Redesigned 2026-09-01 to match the original
 * prototype's white parent-card mockup (old-hackathon-prototype branch,
 * survey.html: buildParentSummary()/buildCopyText()) while keeping the
 * whole Phase 6 backend contract unchanged underneath.
 *
 * The AI-generated (or fallback) `cardText` from POST /api/parent-card
 * is the personalised paragraph -- everything else in the modal
 * (course name, careers, the T-Level Q&A, next steps, Ada's contact
 * details) is static content already in `COURSES`, exactly like the
 * original mockup's structure, just re-composed around the one
 * fact-locked paragraph this project's API actually returns.
 *
 * Gated on `persistState === 'saved'`: POST /api/parent-card looks the
 * result up server-side by shareToken, so it can only succeed once the
 * result actually exists in the `results` table.
 */
export function ParentCardSection({
  topMatch,
  shareToken,
  persistState,
}: {
  topMatch: CourseMatch;
  shareToken: string;
  persistState: PersistState;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'open' | 'error'>('idle');
  const [card, setCard] = useState<ParentCardResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const course = COURSES.find((c) => c.id === topMatch.courseId);

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
      setState('open');
    } catch (err) {
      console.error('[ParentCardSection] could not generate card', err);
      setState('error');
    }
  }

  function close() {
    setState('idle');
  }

  if (persistState !== 'saved') {
    return (
      <div className="border-ada-border bg-ada-card rounded-xl border p-6">
        <p className="text-xl font-extrabold tracking-tight">Show this to your parents.</p>
        <p className="text-ada-grey mt-2 text-sm leading-relaxed">
          {persistState === 'pending'
            ? 'Available once your results have finished saving.'
            : "Your results couldn't be saved this time, so a parent summary isn't available."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-ada-border bg-ada-card rounded-xl border p-6">
        <p className="text-xl font-extrabold tracking-tight">Show this to your parents.</p>
        <p className="text-ada-grey mt-2 mb-5 text-sm leading-relaxed">
          We&rsquo;ve written a plain-English summary of your result — designed to answer the
          questions parents actually ask.
        </p>

        {state === 'error' ? (
          <div>
            <p className="text-ada-grey mb-2 text-sm" role="status">
              Couldn&apos;t generate a summary right now.
            </p>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              className="hover:bg-ada-green-dark bg-ada-green text-ada-black focus-visible:ring-ada-green focus-visible:ring-offset-ada-black min-h-[52px] w-full rounded-lg px-6 py-4 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Try again
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={state === 'loading'}
            className="hover:bg-ada-green-dark bg-ada-green text-ada-black focus-visible:ring-ada-green focus-visible:ring-offset-ada-black min-h-[52px] w-full rounded-lg px-6 py-4 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
          >
            {state === 'loading' ? 'Writing a summary…' : 'Generate parent summary →'}
          </button>
        )}
      </div>

      {state === 'open' && card && course && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/[0.82] p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Parent summary"
        >
          <div className="my-auto w-full max-w-[480px] rounded-xl bg-white p-8 text-[#111]">
            <div className="mb-1 inline-flex items-center text-[28px] leading-none font-extrabold tracking-tight text-[#111]">
              ada
              <span className="ml-[3px] inline-block h-[7px] w-[7px] rounded-full bg-[#00b880]" />
            </div>
            <p className="mb-0.5 text-[13px] text-[#555]">National College for Digital Skills</p>
            <p className="mb-5 text-sm font-semibold text-[#444]">
              Your child&rsquo;s course match from Ada
            </p>
            <hr className="mb-5 border-t-2 border-[#ddd]" />

            <p className="mb-1 text-2xl font-extrabold tracking-tight text-[#111]">{course.name}</p>
            <p className="mb-3.5 text-base font-bold text-[#00b880]">{topMatch.scorePct}% match</p>
            <p className="mb-4.5 text-[15px] leading-relaxed text-[#333]">{card.cardText}</p>

            {card.source === 'fallback' && (
              <p className="mb-4.5 text-xs text-[#777] italic">
                This is a standard summary — our AI writer wasn&apos;t available just now.
              </p>
            )}

            {course.careers && course.careers.length > 0 && (
              <>
                <p className="mb-2 text-sm font-bold text-[#111]">
                  What this means for their future:
                </p>
                <ul className="mb-5">
                  {course.careers.map((career) => (
                    <li
                      key={career}
                      className="py-0.5 text-sm text-[#333] before:mr-1 before:font-bold before:text-[#00b880] before:content-['—']"
                    >
                      {' '}
                      {career}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {course.isTlevel && course.tlevelFaq && course.tlevelFaq.length > 0 && (
              <div className="mb-5 border-t-2 border-[#ddd] pt-5">
                <p className="mb-4 text-[15px] font-extrabold text-[#111]">
                  About T Levels — what parents ask us most:
                </p>
                {course.tlevelFaq.map((item) => (
                  <div key={item.q} className="mb-3.5">
                    <p className="mb-1 text-sm font-bold text-[#111]">Q: {item.q}</p>
                    <p className="text-sm leading-relaxed text-[#444]">A: {item.a}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4 border-t-2 border-[#ddd] pt-4.5 text-sm leading-relaxed text-[#333]">
              <strong>Next step:</strong> Ada holds open evenings in Manchester and London.
              <br />
              Book a place:{' '}
              <a
                href={OPEN_DAYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#00b880] no-underline hover:underline"
              >
                ada.ac.uk/sixth-form/open-days-events
              </a>
            </div>

            <div className="mb-6 text-xs leading-relaxed text-[#777]">
              <strong className="text-[#444]">Ada, the National College for Digital Skills</strong>
              <br />
              ada.ac.uk &nbsp;|&nbsp; info@ada.ac.uk &nbsp;|&nbsp; 0203 1050 125
            </div>

            <div className="flex gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildShareText(course.name, topMatch.scorePct, card.cardText))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-[#25D366] py-3 text-center text-sm font-bold text-white hover:opacity-90"
              >
                Share via WhatsApp
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      buildShareText(course.name, topMatch.scorePct, card.cardText),
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    // Clipboard API can be unavailable -- the text is still visible on the card.
                  }
                }}
                className="flex-1 rounded-lg bg-[#111] py-3 text-sm font-bold text-white hover:bg-black"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-lg border-2 border-[#ccc] py-3 text-sm font-bold text-[#333] hover:border-[#999] hover:text-[#111]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function buildShareText(courseName: string, scorePct: number, cardText: string): string {
  return [
    'ada.',
    '',
    "Your child's course match from Ada",
    'National College for Digital Skills',
    '',
    `${courseName} — ${scorePct}% match`,
    '',
    cardText,
    '',
    'Next step: Ada holds open evenings in Manchester and London.',
    'Book a place: ada.ac.uk/sixth-form/open-days-events',
    '',
    'Ada, the National College for Digital Skills',
    'ada.ac.uk | info@ada.ac.uk | 0203 1050 125',
  ].join('\n');
}
