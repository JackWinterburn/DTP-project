'use client';

import type { Question } from '@/types/quiz';

/**
 * One question, one screen (FR2, ticket #13). Real <input type="radio">
 * elements -- not styled <div>s -- so screen readers announce them
 * correctly and every option is keyboard-reachable/selectable without a
 * mouse (NFR2). The whole option card gets a visible focus ring via
 * `has-[:focus-visible]` so keyboard users can see where they are without
 * relying on the browser's default (often near-invisible) radio outline.
 */
export function QuestionScreen({
  question,
  selectedOptionId,
  onSelect,
  onBack,
  onSkip,
  canGoBack,
}: {
  question: Question;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  onSkip: () => void;
  canGoBack: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-xl font-semibold text-balance">{question.text}</legend>

      {question.options.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-neutral-300 p-4 text-base transition-colors has-checked:border-indigo-600 has-checked:bg-indigo-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-600 has-[:focus-visible]:ring-offset-2 dark:border-neutral-700 dark:has-checked:border-indigo-500 dark:has-checked:bg-indigo-950"
        >
          <input
            type="radio"
            name={question.id}
            value={option.id}
            checked={selectedOptionId === option.id}
            onChange={() => onSelect(option.id)}
            className="h-5 w-5 shrink-0 accent-indigo-600"
          />
          {option.label}
        </label>
      ))}

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-md px-2 py-1 font-medium text-neutral-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md px-2 py-1 font-medium text-neutral-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none dark:text-neutral-400"
        >
          Skip
        </button>
      </div>
    </fieldset>
  );
}
