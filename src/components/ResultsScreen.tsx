'use client';

import { useState } from 'react';
import { COURSES } from '@/config';
import type { CourseMatch, PersistState, Result } from '@/types/quiz';
import { ParentCardSection } from './ParentCardSection';
import { EmailOptinForm } from './EmailOptinForm';

function findCourse(courseId: string) {
  return COURSES.find((c) => c.id === courseId);
}

/**
 * Results page (ticket #14, FR3 + FR4). Redesigned 2026-09-01 to match
 * the original hackathon prototype's dark "ada" visual language
 * (old-hackathon-prototype branch, survey.html) -- top match card,
 * "Why this suits you" reasons, a collapsible T-Level callout, and
 * collapsible other-course cards -- while keeping every FR3/FR4/FR5/FR8
 * behaviour this screen already had (persisted share link, parent card,
 * email opt-in).
 *
 * Every match still shows its percentage *and* the specific reasons
 * behind it -- never a bare number -- because unexplained percentage
 * scores are a named adoption barrier in the exemplar feedback this
 * project answers. Percentages are each course's own normalised score
 * (see ScoringEngine), not a shared 100% split.
 */
export function ResultsScreen({
  result,
  persistState,
  sessionId,
  onRestart,
}: {
  result: Result;
  persistState: PersistState;
  sessionId: string | null;
  onRestart: () => void;
}) {
  const [topMatch, ...otherMatches] = result.matches;
  const topCourse = topMatch ? findCourse(topMatch.courseId) : undefined;

  return (
    <div>
      <div className="mb-6 inline-flex items-center text-[22px] leading-none font-extrabold tracking-tight">
        ada
        <span className="bg-ada-green ml-[3px] inline-block h-1.5 w-1.5 rounded-full" />
      </div>

      <p className="text-ada-green mb-2 text-xs font-bold tracking-[0.1em] uppercase">
        Your result
      </p>
      <h2 className="mb-7 text-[32px] leading-[1.15] font-extrabold tracking-tight">
        You&rsquo;ve found
        <br />
        your path.
      </h2>

      {topMatch && topCourse && <TopMatchCard match={topMatch} course={topCourse} />}

      {topMatch && topMatch.reasons.length > 0 && (
        <section className="mb-7">
          <h3 className="mb-3.5 text-base font-extrabold tracking-tight">Why this suits you</h3>
          <ul className="flex flex-col gap-2.5">
            {topMatch.reasons.map((reason) => (
              <li key={reason} className="text-ada-light-grey flex gap-2.5 text-sm leading-relaxed">
                <span aria-hidden="true" className="text-ada-green mt-px shrink-0 font-extrabold">
                  →
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topCourse?.isTlevel && (topCourse.tLevelFacts?.length ?? 0) > 0 && (
        <TLevelCallout course={topCourse} />
      )}

      {topCourse?.note && (
        <div className="border-ada-warning/30 bg-ada-card mb-7 flex gap-2.5 rounded-xl border p-4 text-sm leading-relaxed">
          <span aria-hidden="true" className="mt-px shrink-0 text-lg">
            📋
          </span>
          <div>
            <p className="text-ada-warning mb-1 text-xs font-bold tracking-wide uppercase">Note</p>
            <p className="text-ada-light-grey">{topCourse.note}</p>
          </div>
        </div>
      )}

      <SaveLinkSection persistState={persistState} shareToken={result.shareToken} />

      {otherMatches.length > 0 && (
        <section className="mt-7">
          <h3 className="text-ada-grey mb-3 text-[11px] font-bold tracking-[0.1em] uppercase">
            Other courses that could suit you
          </h3>
          <div className="flex flex-col gap-2.5">
            {otherMatches.map((match) => {
              const course = findCourse(match.courseId);
              if (!course) return null;
              return <OtherCourseCard key={match.courseId} match={match} course={course} />;
            })}
          </div>
        </section>
      )}

      <div className="mt-9 flex flex-col gap-3">
        {topMatch && (
          <ParentCardSection
            topMatch={topMatch}
            shareToken={result.shareToken}
            persistState={persistState}
          />
        )}
        <EmailOptinForm sessionId={sessionId} />
        <button
          type="button"
          onClick={onRestart}
          className="text-ada-grey hover:text-ada-white focus-visible:ring-ada-green mt-2 rounded-md px-2 py-1 text-sm font-semibold underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Retake the quiz
        </button>
      </div>
    </div>
  );
}

function TopMatchCard({
  match,
  course,
}: {
  match: CourseMatch;
  course: NonNullable<ReturnType<typeof findCourse>>;
}) {
  const details: [string, string | undefined][] = [
    ['Qualification', course.qualification],
    ['Equivalent', course.equivalent],
    ['Campus', course.campus],
    ['Entry', course.entryRequirement],
  ];

  return (
    <div className="border-ada-green bg-ada-card relative mb-6 overflow-hidden rounded-xl border-2 p-6">
      <div className="from-ada-green to-ada-green/10 absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r" />

      <div className="mb-3.5 flex items-start justify-between">
        <div aria-hidden="true" className="text-4xl leading-none">
          {course.badge ?? '⚡'}
        </div>
        <div className="text-right">
          <div className="text-ada-green text-[44px] leading-none font-extrabold tracking-tight">
            {match.scorePct}
            <sup className="text-xl font-bold">%</sup>
          </div>
          <div className="text-ada-grey text-xs font-semibold tracking-wide uppercase">match</div>
        </div>
      </div>

      <h3 className="mb-1 text-xl leading-tight font-extrabold tracking-tight">{course.name}</h3>
      {course.tagline && (
        <p className="text-ada-green mb-4 text-xs font-bold tracking-wide uppercase">
          {course.tagline}
        </p>
      )}

      <div
        role="img"
        aria-label={`${match.scorePct}% match`}
        className="bg-ada-border mb-4 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="from-ada-green-dark to-ada-green h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out"
          style={{ width: `${match.scorePct}%` }}
        />
      </div>

      {course.description && (
        <p className="text-ada-light-grey mb-4 text-sm leading-relaxed">{course.description}</p>
      )}

      {details.some(([, v]) => v) && (
        <dl className="mb-4 flex flex-col gap-2">
          {details.map(
            ([label, value]) =>
              value && (
                <div key={label} className="flex gap-2.5 text-[13px]">
                  <dt className="text-ada-grey min-w-[90px] shrink-0 font-bold">{label}</dt>
                  <dd className="text-ada-light-grey leading-tight">{value}</dd>
                </div>
              ),
          )}
        </dl>
      )}

      {course.url && (
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-ada-border hover:border-ada-green hover:text-ada-green block rounded-lg border-2 py-3 text-center text-sm font-bold transition-colors"
        >
          Learn more about this pathway →
        </a>
      )}
    </div>
  );
}

function TLevelCallout({ course }: { course: NonNullable<ReturnType<typeof findCourse>> }) {
  const [open, setOpen] = useState(false);
  const bodyId = `tlevel-body-${course.id}`;

  return (
    <div className="border-ada-green bg-ada-green/[0.04] border-ada-green/15 mb-7 overflow-hidden rounded-r-xl border-t border-r border-b border-l-[3px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-3 p-[18px_20px] text-left"
      >
        <div>
          <div className="text-ada-green text-[15px] font-bold">What is a T Level?</div>
          <div className="text-ada-grey mt-0.5 text-[13px]">
            Tap to find out — it&rsquo;s not what you might think
          </div>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`text-ada-green h-5 w-5 shrink-0 transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div id={bodyId} className="px-5 pb-5">
          <p className="mb-4 text-lg leading-snug font-extrabold tracking-tight">
            A T Level isn&rsquo;t a compromise. It&rsquo;s a head start.
          </p>
          <ul className="mb-3.5 flex flex-col gap-2.5">
            {(course.tLevelFacts ?? []).map((fact) => (
              <li key={fact} className="text-ada-light-grey flex gap-2.5 text-sm leading-relaxed">
                <span aria-hidden="true" className="text-ada-green shrink-0 font-extrabold">
                  ✓
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          <p className="text-ada-grey text-[13px] italic">
            84% of Ada sixth form students secure their first choice destination.
          </p>
        </div>
      )}
    </div>
  );
}

function OtherCourseCard({
  match,
  course,
}: {
  match: CourseMatch;
  course: NonNullable<ReturnType<typeof findCourse>>;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = `other-course-${course.id}`;

  return (
    <div className="border-ada-border hover:border-ada-green/20 bg-ada-card overflow-hidden rounded-xl border transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3.5 p-4"
      >
        <div aria-hidden="true" className="shrink-0 text-2xl leading-none">
          {course.badge ?? '📘'}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[15px] font-bold">{course.name}</div>
          {course.tagline && (
            <div className="text-ada-grey overflow-hidden text-xs font-semibold text-ellipsis whitespace-nowrap">
              {course.tagline}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-ada-green block text-xl leading-none font-extrabold">
            {match.scorePct}%
          </span>
          <span className="text-ada-grey text-[10px] font-semibold tracking-wide uppercase">
            match
          </span>
        </div>
      </button>

      {open && (
        <div id={bodyId} className="border-ada-border border-t p-4">
          {course.description && (
            <p className="text-ada-light-grey mb-3 text-sm leading-relaxed">{course.description}</p>
          )}
          {course.careers && course.careers.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {course.careers.map((career) => (
                <span
                  key={career}
                  className="bg-ada-border text-ada-light-grey rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {career}
                </span>
              ))}
            </div>
          )}
          {course.entryRequirement && (
            <p className="text-ada-grey mb-2.5 text-xs leading-relaxed">
              <strong className="text-ada-light-grey">Entry:</strong> {course.entryRequirement}
            </p>
          )}
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ada-green text-[13px] font-bold hover:underline"
            >
              Find out more →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Surfaces FR8/Risk R3's mitigation in the UI: the share-token URL, not
 * localStorage, is the primary persistence mechanism ("save this link /
 * send it to yourself"). Honest about whether that link actually works
 * right now -- `persistState` reflects a real background save, not an
 * assumption, so this never promises a link that quietly doesn't work
 * (e.g. the save API was unreachable).
 */
function SaveLinkSection({
  persistState,
  shareToken,
}: {
  persistState: PersistState;
  shareToken: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${shareToken}` : '';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (permissions, older browsers) --
      // the URL is still shown as selectable text, so this fails quietly.
    }
  }

  if (persistState === 'pending') {
    return (
      <p className="text-ada-grey mt-2 text-sm" role="status">
        Saving your results…
      </p>
    );
  }

  if (persistState === 'unsaved') {
    return (
      <p className="text-ada-grey mt-2 text-sm" role="status">
        Your results couldn&apos;t be saved this time, so this link won&apos;t work later — take a
        screenshot if you want to keep them.
      </p>
    );
  }

  return (
    <div className="border-ada-border bg-ada-card mt-2 rounded-xl border p-4">
      <p className="text-sm font-semibold">Save this link, or send it to yourself</p>
      <p className="text-ada-grey mt-1 text-xs">
        No account needed — this link is the only way to come back to your results.
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          aria-label="Your results link"
          onFocus={(e) => e.currentTarget.select()}
          className="border-ada-border bg-ada-black text-ada-light-grey min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="hover:bg-ada-green-dark bg-ada-green text-ada-black focus-visible:ring-ada-green focus-visible:ring-offset-ada-black shrink-0 rounded-md px-3 py-1.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
