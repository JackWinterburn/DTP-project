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
  const [sessionId, setSessionId] = useState<string | null>(null);
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
      setSessionId(data.sessionId);
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
    setSessionId(null);
  }

  return (
    <div
      className={`mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 sm:max-w-lg sm:p-8 md:max-w-2xl lg:max-w-3xl ${
        stage === 'results' ? '' : 'justify-center'
      }`}
    >
      {/* Announces progress/completion changes to screen-reader users without moving visible focus (NFR2). */}
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {stage === 'landing' && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="mb-6 inline-flex items-center text-[22px] leading-none font-extrabold tracking-tight">
            ada
            <span className="bg-ada-green ml-[3px] inline-block h-1.5 w-1.5 rounded-full" />
          </div>
          <h1 className="text-[44px] leading-[1.05] font-extrabold tracking-tight">
            Find <span className="text-ada-green">Your Path</span>.
          </h1>
          <p className="text-ada-light-grey max-w-xs text-lg leading-relaxed">
            Answer a few quick questions and get a personalised course match — no account needed.
          </p>
          <button
            type="button"
            onClick={() => {
              void ensureSession();
              setStage('question');
              announce(`Question 1 of ${QUESTIONS.length}`);
            }}
            className="bg-ada-green text-ada-black hover:bg-ada-green-dark focus-visible:ring-ada-green focus-visible:ring-offset-ada-black mt-2 min-h-[52px] w-full rounded-lg px-6 py-4 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Start the quiz
          </button>
          <p className="text-ada-grey text-sm">Takes about 3 minutes</p>
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
        <ResultsScreen
          result={result}
          persistState={persistState}
          sessionId={sessionId}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
