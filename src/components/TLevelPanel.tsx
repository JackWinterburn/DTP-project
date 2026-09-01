import { TLEVEL_FACTS } from '@/config';

const PLACEHOLDER_PREFIX = '[PLACEHOLDER';

/**
 * T-Level context panel (ticket #15, FR5) -- shown only when the top
 * match is a T-Level. Facts come from src/config/courses.ts's
 * TLEVEL_FACTS, which is deliberately seeded with placeholder strings
 * pending Ada sign-off (Risk R1/R8). Rather than let bracketed
 * placeholder text read as a broken page to anyone previewing the pilot,
 * this renders it plainly but with an explicit "not yet confirmed" note
 * -- honest to a real student, and legible as a deliberate
 * content-governance decision (not a bug) to anyone reviewing the build.
 */
export function TLevelPanel({ courseId }: { courseId: string }) {
  const facts = TLEVEL_FACTS.find((f) => f.courseId === courseId);
  if (!facts) return null;

  const isPending = (value: string) => value.startsWith(PLACEHOLDER_PREFIX);

  return (
    <section
      aria-labelledby="tlevel-panel-heading"
      className="mt-6 rounded-xl border-2 border-neutral-300 p-4 dark:border-neutral-700"
    >
      <h3 id="tlevel-panel-heading" className="text-lg font-semibold">
        What a T-Level involves
      </h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Some details below are pilot placeholders awaiting confirmation from Ada admissions and
        industry partnerships -- not yet verified figures.
      </p>

      <dl className="mt-3 flex flex-col gap-3 text-sm">
        <div>
          <dt className="font-medium">UCAS points</dt>
          <dd
            className={
              isPending(facts.ucasPointsHeadline)
                ? 'text-neutral-500 italic dark:text-neutral-400'
                : ''
            }
          >
            {facts.ucasPointsHeadline}
          </dd>
        </div>
        <div>
          <dt className="font-medium">University acceptance</dt>
          <dd
            className={
              isPending(facts.universityAcceptance)
                ? 'text-neutral-500 italic dark:text-neutral-400'
                : ''
            }
          >
            {facts.universityAcceptance}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Employer partners</dt>
          <dd>
            <ul className="list-inside list-disc">
              {facts.employerPartners.map((partner) => (
                <li
                  key={partner}
                  className={
                    isPending(partner) ? 'text-neutral-500 italic dark:text-neutral-400' : ''
                  }
                >
                  {partner}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
