'use client';

import type { Question } from '@/types/quiz';

/**
 * One question, one screen (FR2, ticket #13). Real <input type="radio">
 * elements -- not styled <div>s -- so screen readers announce them
 * correctly and every option is keyboard-reachable/selectable without a
 * mouse (NFR2). Visual design matches the original prototype's
 * `.option-btn` cards: dark card, green border + tint + circular
 * checkmark when selected. The whole option card gets a visible focus
 * ring via `has-[:focus-visible]` so keyboard users can see where they
 * are without relying on the browser's default (often near-invisible)
 * radio outline.
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
      <legend className="mb-2 text-[22px] leading-[1.3] font-extrabold tracking-tight text-balance">
        {question.text}
      </legend>

      {question.options.map((option) => {
        const selected = selectedOptionId === option.id;
        return (
          <label
            key={option.id}
            className={`has-[:focus-visible]:ring-ada-green has-[:focus-visible]:ring-offset-ada-black flex min-h-[60px] cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-[18px_20px] text-[15px] font-semibold transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 ${
              selected
                ? 'border-ada-green bg-ada-green/[0.07] text-ada-green'
                : 'border-ada-border bg-ada-card text-ada-white hover:border-ada-green/50 hover:translate-x-[3px]'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selected}
              onChange={() => onSelect(option.id)}
              className="sr-only"
            />
            <span>{option.label}</span>
            <span
              aria-hidden="true"
              className={`bg-ada-green flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                selected ? 'scale-100 opacity-100' : 'scale-[0.6] opacity-0'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M4 10.5L8 14.5L16 5.5"
                  stroke="#0a0a0a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </label>
        );
      })}

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="text-ada-grey hover:text-ada-white focus-visible:ring-ada-green rounded-md px-2 py-1 font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-ada-grey hover:text-ada-white focus-visible:ring-ada-green rounded-md px-2 py-1 font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Skip
        </button>
      </div>
    </fieldset>
  );
}
