/**
 * Question progress indicator (FR2: gamified, no time limit -- progress is
 * shown so the length feels bounded, without a countdown). Text label
 * doubles as the accessible name so progress isn't colour-only (NFR2).
 */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <p className="mb-1 text-right text-sm text-neutral-500 dark:text-neutral-400">
        Question {current} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
        className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] dark:bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
