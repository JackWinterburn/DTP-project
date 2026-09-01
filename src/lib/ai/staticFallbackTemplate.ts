import type { ParentCardInput } from './aiProvider';

/**
 * Deterministic, non-AI fallback (ticket #23, NFR6). Built from exactly
 * the same fact-locked input as the AI path -- never introduces anything
 * the AI path couldn't also have said -- so a parent gets the same
 * substance either way, just without the model's rewrite. Runs when the
 * AI call errors, times out, or its output fails validation; the
 * response's `source: "fallback"` field is how the caller (and, per
 * ticket #23, the UI) can tell which path produced it.
 */
export function buildStaticFallbackCard(input: ParentCardInput): string {
  const { topMatch, facts } = input;

  const reasonSentence =
    topMatch.reasons.length > 0
      ? ` This is because they showed a strong interest in ${topMatch.reasons.length} area${topMatch.reasons.length > 1 ? 's' : ''} that match the course.`
      : '';

  const factSentence = facts
    ? [
        facts.qualification ? `It leads to ${facts.qualification}.` : '',
        facts.equivalent ? `This is equivalent to ${facts.equivalent}.` : '',
        facts.employerPartners.length > 0
          ? `Ada's industry partners for this course include ${facts.employerPartners.join(', ')}.`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  const adviceSentence = facts
    ? ''
    : ' Ask your child’s school or Ada directly for exact entry requirements and university progression routes.';

  return (
    `Your child's top course match from the Ada Course Finder quiz is ${topMatch.courseName} ` +
    `(a ${topMatch.scorePct}% match).${reasonSentence}${factSentence ? ` ${factSentence}` : ''}` +
    `${adviceSentence}`
  ).trim();
}
