'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONS } from '@/config';
import { ScoringEngine } from '@/lib/scoring/scoringEngine';
import type { QuizAnswers, Result } from '@/types/quiz';
import { ProgressBar } from './ProgressBar';
import { QuestionScreen } from './QuestionScreen';
import { ResultsScreen } from './ResultsScreen';

type Stage = 'landing' | 'question' | 'results';

/**
 * Orchestrates the whole student journey: landing -> one-question-per-
 * screen quiz -> results (tickets #13/#14). Scoring runs client-side via
 * ScoringEngine, per the architecture ("no database call needed to
 * compute matches").
 *
 * `qrToken` is threaded through from the route (see src/app/q/) but not
 * used yet -- capturing it into a persisted session is Phase 5's
 * POST /api/sessions (ticket #17). For now the whole journey is
 * client-only: nothing is saved, and the result's shareToken isn't a
 * working URL yet. That's the natural next phase, not a bug in this one.
 */
export function QuizFlow({ qrToken }: { qrToken: string | null }) {
  const [stage, setStage] = useState<Stage>('landing');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<Result | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const engine = useMemo(() => new ScoringEngine(), []);

  // qrToken isn't persisted anywhere yet -- capturing it into a real
  // session is Phase 5's POST /api/sessions (ticket #17). Logged here so
  // QR routing can be sanity-checked before that route exists.
  useEffect(() => {
    if (qrToken) console.debug(`[QuizFlow] reached via QR token: ${qrToken}`);
  }, [qrToken]);

  function announce(message: string) {
    if (liveRegionRef.current) liveRegionRef.current.textContent = message;
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
    announce('Your results are ready.');
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

      {stage === 'results' && result && <ResultsScreen result={result} onRestart={handleRestart} />}
    </div>
  );
}
