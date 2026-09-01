import type { ParentCardInput } from './aiProvider';

/**
 * Builds the fact-locked prompt (ticket #21, Risk R1's core mitigation).
 * The model is given the match data as plain facts and instructed only
 * to rephrase them into one warm, plain-language paragraph -- never to
 * add a UCAS figure, employer name, entry requirement, or any other
 * specific claim that isn't already in the prompt. Facts come from
 * getCourseFacts() (factProvider.ts), which has already stripped out any
 * unverified Phase 2 placeholder -- so if `input.facts` is null or a
 * field is null, that information genuinely isn't available yet, and the
 * prompt tells the model to say so rather than invent it.
 */
export function buildParentCardPrompt(input: ParentCardInput): string {
  const { topMatch, otherMatches, facts } = input;

  const factLines: string[] = [];
  if (facts) {
    if (facts.qualification) factLines.push(`Qualification: ${facts.qualification}`);
    if (facts.equivalent) factLines.push(`Equivalent to: ${facts.equivalent}`);
    if (facts.entryRequirement) factLines.push(`Entry requirement: ${facts.entryRequirement}`);
    if (facts.employerPartners.length > 0) {
      factLines.push(`Employer partners: ${facts.employerPartners.join(', ')}`);
    }
  }

  const otherMatchLines = otherMatches
    .slice(0, 2)
    .map((m) => `- ${m.courseName} (${m.scorePct}% match)`)
    .join('\n');

  return `You are writing a short, warm, plain-language message for a parent whose Year 10-11 child \
just completed a course-matching quiz at Ada, National College for Digital Skills. Do not use jargon.

The child's top course match: ${topMatch.courseName} (${topMatch.scorePct}% match).
Reasons for this match:
${topMatch.reasons.map((r) => `- ${r}`).join('\n') || '- (no specific reasons recorded)'}

${otherMatchLines ? `Other matches, for context only:\n${otherMatchLines}\n\n` : ''}${
    factLines.length > 0
      ? `Verified facts you may mention (do not alter these figures or names):\n${factLines.join('\n')}\n\n`
      : ''
  }STRICT RULES -- follow exactly:
1. Use ONLY the facts given above. Do not state a UCAS point figure, employer name, entry requirement, \
or any other specific number or named organisation that is not explicitly listed above.
2. If no verified facts are listed above, do not invent any -- write generally about the course match \
and suggest the parent ask their child's school for exact entry requirements.
3. Write exactly one short paragraph (2-4 sentences), plain language, no bullet points, no headings.
4. Do not mention percentages as the main point -- lead with what the course involves and why it suits \
the child, using the reasons given.
5. Do not address the child directly ("you") -- write to the parent, about their child.

Write the paragraph now, with no preamble or extra commentary.`;
}
