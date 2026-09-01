'use client';

import { useState } from 'react';
import { COURSES } from '@/config';
import type { CourseMatch, Result } from '@/types/quiz';
import { TLevelPanel } from './TLevelPanel';

const HEADLINE_COUNT = 3;

function courseName(courseId: string): string {
  return COURSES.find((c) => c.id === courseId)?.name ?? courseId;
}

/**
 * Results page (ticket #14, FR3 + FR4). Every match shows its percentage
 * *and* the specific reasons behind it -- never a bare number -- because
 * unexplained percentage scores are a named adoption barrier in the
 * exemplar feedback this project answers. Percentages are each course's
 * own normalised score (see ScoringEngine), not a shared 100% split, so
 * they're shown as independent bars rather than a pie/stacked chart that
 * would visually imply they sum to something.
 */
export function ResultsScreen({ result, onRestart }: { result: Result; onRestart: () => void }) {
  const [showAll, setShowAll] = useState(false);
  const headline = result.matches.slice(0, HEADLINE_COUNT);
  const rest = result.matches.slice(HEADLINE_COUNT);
  const topMatch = result.matches[0];
  const topCourse = COURSES.find((c) => c.id === topMatch?.courseId);

  return (
    <div>
      <h2 className="text-xl font-semibold">Your matches</h2>

      <ul className="mt-4 flex flex-col gap-3">
        {headline.map((match, i) => (
          <MatchCard key={match.courseId} match={match} isTop={i === 0} />
        ))}
      </ul>

      {rest.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="mt-3 rounded-md px-2 py-1 text-sm font-medium text-indigo-700 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:text-indigo-400"
          >
            {showAll ? 'Show fewer matches' : `Show all ${result.matches.length} matches`}
          </button>
          {showAll && (
            <ul className="mt-3 flex flex-col gap-3">
              {rest.map((match) => (
                <MatchCard key={match.courseId} match={match} isTop={false} />
              ))}
            </ul>
          )}
        </>
      )}

      {topCourse?.isTlevel && <TLevelPanel courseId={topCourse.id} />}

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-md px-2 py-1 text-sm font-medium text-neutral-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:text-neutral-400"
      >
        Retake the quiz
      </button>
    </div>
  );
}

function MatchCard({ match, isTop }: { match: CourseMatch; isTop: boolean }) {
  return (
    <li
      className={`rounded-xl border-2 p-4 ${
        isTop
          ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900'
          : 'border-neutral-300 dark:border-neutral-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{courseName(match.courseId)}</span>
        {isTop ? (
          <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
            TOP MATCH
          </span>
        ) : (
          <span className="text-sm font-medium">{match.scorePct}%</span>
        )}
      </div>

      <div
        role="img"
        aria-label={`${match.scorePct}% match`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <div
          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
          style={{ width: `${match.scorePct}%` }}
        />
      </div>

      {match.reasons.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400">
          {match.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-neutral-500 italic dark:text-neutral-400">
          None of your answers pointed toward this course.
        </p>
      )}
    </li>
  );
}
