import type { ParentCardInput } from './aiProvider';

const MIN_LENGTH = 40;
const MAX_LENGTH = 700;

/**
 * Validates a generated card against the facts it was fact-locked to
 * (ticket #23, NFR6, Risk R1). Deliberately cheap checks rather than
 * deep NLP fact-checking -- this is a last line of defence, not the
 * primary mitigation (the prompt's strict rules are), so it's aimed at
 * catching the failure modes that actually matter: a leaked placeholder
 * marker, a wildly wrong length (truncated/rambling), or text that
 * doesn't even seem to be about the right course.
 */
export function isValidParentCard(text: string, input: ParentCardInput): boolean {
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) return false;

  // Guards against a leaked, unresolved Phase 2 placeholder marker making
  // it into parent-facing text.
  if (/\[PLACEHOLDER|\bPLACEHOLDER\b/i.test(text)) return false;

  // Sanity check: the card should actually be about the top match. A
  // response that never mentions the course name at all is more likely a
  // malformed/hallucinated answer than a faithful rewrite.
  const courseNameFragment = input.topMatch.courseName.split(' ').slice(0, 2).join(' ');
  if (!text.toLowerCase().includes(courseNameFragment.toLowerCase())) return false;

  return true;
}
