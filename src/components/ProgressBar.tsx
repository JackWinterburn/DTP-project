/**
 * Quiz header: ada logo, "X of Y" counter, thin progress track (FR2:
 * gamified, no time limit -- progress is shown so the length feels
 * bounded, without a countdown). Matches the original prototype's
 * `.quiz-sticky-header` layout. Text label doubles as part of the
 * accessible name so progress isn't colour-only (NFR2).
 */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="inline-flex items-center text-[22px] leading-none font-extrabold tracking-tight">
          ada
          <span className="bg-ada-green ml-[3px] inline-block h-1.5 w-1.5 rounded-full" />
        </div>
        <p className="text-ada-grey text-[13px] font-bold tracking-wide">
          {current} of {total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
        className="bg-ada-border h-[3px] overflow-hidden rounded-full"
      >
        <div
          className="bg-ada-green h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
