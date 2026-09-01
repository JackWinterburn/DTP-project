'use client';

import { useMemo, useRef, useState } from 'react';
import { QUESTIONS } from '@/config';
import { ScoringEngine } from '@/lib/scoring/scoringEngine';
import type { PersistState, QuizAnswers, Result } from '@/types/quiz';
import { ProgressBar } from './ProgressBar';
import { QuestionScreen } from './QuestionScreen';
import { ResultsScreen } from './ResultsScreen';

type Stage = 'landing' | 'question' | 'results';

function detectDeviceClass(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  // Touch-primary input, not viewport width -- this drives quiz_sessions.
  // device_class (engagement analytics per the architecture), which cares
  // about how the student is holding the device, not the layout.
  return window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop';
}

/**
 * Orchestrates the whole student journey: landing -> one-question-per-
 * screen quiz -> results (tickets #13/#14), now wired to Phase 5's
 * persistence routes (#17/#18).
 *
 * Scoring itself stays instant and client-only (ScoringEngine, per the
 * architecture: "no database call needed to compute matches") --
 * persistence happens in the background and never blocks the results
 * reveal. If session creation or the results POST fails or is slow (API
 * down, offline, etc.), the student still sees their client-computed
 * results immediately; they just aren't saved/shareable across devices,
 * which ResultsScreen surfaces honestly via `persistState` rather than
 * silently pretending the link works.
 */
export function QuizFlow({ qrToken }: { qrToken: string | null }) {
  const [stage, setStage] = useState<Stage>('landing');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [persistState, setPersistState] = useState<PersistState>('pending');
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const engine = useMemo(() => new ScoringEngine(), []);
  const sessionIdRef = useRef<string | null>(null);
  const sessionRequestedRef = useRef(false);

  function announce(message: string) {
    if (liveRegionRef.current) liveRegionRef.current.textContent = message;
  }

  // Fires once, when the student actually starts (not on page load, so an
  // organic visitor who never starts doesn't create an orphan session).
  async function ensureSession() {
    if (sessionRequestedRef.current) return;
    sessionRequestedRef.current = true;
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: qrToken ?? undefined, deviceClass: detectDeviceClass() }),
      });
      if (!res.ok) throw new Error(`POST /api/sessions -> ${res.status}`);
      const data: { sessionId: string } = await res.json();
      sessionIdRef.current = data.sessionId;
    } catch (err) {
      console.error('[QuizFlow] could not create session -- results will be local-only', err);
    }
  }

  // Runs after scoring, in the background -- never blocks showing results.
  async function persistResult(scored: Result) {
    if (!sessionIdRef.current) {
      setPersistState('unsaved');
      return;
    }
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, matches: scored.matches }),
      });
      if (!res.ok) throw new Error(`POST /api/results -> ${res.status}`);
      const data: { shareToken: string } = await res.json();
      // Swap in the server-issued token -- the real, persisted one (see
      // the API route's own comment on why this differs from the token
      // ScoringEngine generated).
      setResult((prev) => (prev ? { ...prev, shareToken: data.shareToken } : prev));
      setPersistState('saved');
    } catch (err) {
      console.error('[QuizFlow] could not save result -- showing local-only results', err);
      setPersistState('unsaved');
    }
  }

  function goToFirstUnanswered(): number {
    return QUESTIONS.findIndex((q) => !answers[q.id]);
  }

  function finishOrAdvance(nextAnswers: QuizAnswers, fromIndex: number) {
    const isLastQuestion = fromIndex === QUESTIONS.length - 1;
    if (!isLastQuestion) {
      setQuestionIndex(fromIndex + 1);
      announce(`Question ${fromIndex + 2} of ${QUESTIONS.length}`);
      return;
    }

    const firstUnanswered = QUESTIONS.findIndex((q) => !nextAnswers[q.id]);
    if (firstUnanswered !== -1) {
      setQuestionIndex(firstUnanswered);
      announce(`Answer question ${firstUnanswered + 1} to see your results.`);
      return;
    }

    const scored = engine.score(nextAnswers);
    setResult(scored);
    setStage('results');
    setPersistState('pending');
    announce('Your results are ready.');
    void persistResult(scored);
  }

  function handleSelect(optionId: string) {
    const question = QUESTIONS[questionIndex];
    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);
    finishOrAdvance(nextAnswers, questionIndex);
  }

  function handleSkip() {
    const isLastQuestion = questionIndex === QUESTIONS.length - 1;
    if (!isLastQuestion) {
      setQuestionIndex(questionIndex + 1);
      announce(`Question ${questionIndex + 2} of ${QUESTIONS.length}`);
      return;
    }
    const firstUnanswered = goToFirstUnanswered();
    if (firstUnanswered !== -1) {
      setQuestionIndex(firstUnanswered);
      announce(`Answer question ${firstUnanswered + 1} to see your results.`);
      return;
    }
    finishOrAdvance(answers, questionIndex);
  }

  function handleBack() {
    setQuestionIndex((i) => Math.max(0, i - 1));
  }

  function handleRestart() {
    setAnswers({});
    setResult(null);
    setQuestionIndex(0);
    setStage('landing');
    setPersistState('pending');
    sessionIdRef.current = null;
    sessionRequestedRef.current = false;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      {/* Announces progress/completion changes to screen-reader users without moving visible focus (NFR2). */}
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {stage === 'landing' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-neutral-400 text-xs font-bold text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            ADA
          </div>
          <h1 className="text-3xl font-bold">Find Your Path</h1>
          <p className="max-w-xs text-neutral-600 dark:text-neutral-400">
            Answer a few quick questions and get a personalised course match — no account needed.
          </p>
          <button
            type="button"
            onClick={() => {
              void ensureSession();
              setStage('question');
              announce(`Question 1 of ${QUESTIONS.length}`);
            }}
            className="w-full rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-100 dark:text-neutral-900"
          >
            Start the quiz
          </button>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Takes about 3 minutes</p>
        </div>
      )}

      {stage === 'question' && (
        <div className="flex flex-col gap-4">
          <ProgressBar current={questionIndex + 1} total={QUESTIONS.length} />
          <QuestionScreen
            question={QUESTIONS[questionIndex]}
            selectedOptionId={answers[QUESTIONS[questionIndex].id]}
            onSelect={handleSelect}
            onBack={handleBack}
            onSkip={handleSkip}
            canGoBack={questionIndex > 0}
          />
        </div>
      )}

      {stage === 'results' && result && (
        <ResultsScreen result={result} persistState={persistState} onRestart={handleRestart} />
      )}
    </div>
  );
}
