import type { AiProvider, ParentCardInput, ParentCardMatch } from './aiProvider';
import { getCourseFacts } from './factProvider';
import { GeminiProvider } from './geminiProvider';
import { buildStaticFallbackCard } from './staticFallbackTemplate';
import { isValidParentCard } from './validateOutput';
import type { CourseMatch } from '@/types/quiz';
import { COURSES } from '@/config';

export interface ParentCardResult {
  cardText: string;
  source: 'ai' | 'fallback';
}

function courseName(courseId: string): string {
  return COURSES.find((c) => c.id === courseId)?.name ?? courseId;
}

function toParentCardMatch(match: CourseMatch): ParentCardMatch {
  return {
    courseName: courseName(match.courseId),
    scorePct: match.scorePct,
    reasons: match.reasons,
  };
}

/**
 * Orchestrates the parent-card feature end to end (tickets #21-23):
 * builds the fact-locked input from the abstract fact-provider, calls
 * the injected AiProvider, validates the output, and falls back to the
 * static template on any error or validation failure -- this function
 * NEVER throws for an AI/validation problem (NFR6, and the API contract:
 * "AI/validation failure degrades to 200 fallback, never a hard error").
 * It only ever throws for a genuine programming error (e.g. an unknown
 * courseId), which the caller (the API route) still shouldn't crash on,
 * but that's a bug to fix, not a runtime condition to degrade past.
 *
 * `provider` defaults to GeminiProvider but is a parameter specifically
 * so a test (or a future GPT-4o mini fallback provider) can inject a
 * different AiProvider without touching this function -- the
 * Dependency Inversion documented in Section 3.7.
 */
export async function generateParentCard(
  matches: CourseMatch[],
  provider: AiProvider = new GeminiProvider(),
): Promise<ParentCardResult> {
  const [top, ...rest] = matches;
  if (!top) {
    throw new Error('generateParentCard called with no matches');
  }

  const facts = getCourseFacts(top.courseId);
  const input: ParentCardInput = {
    topMatch: toParentCardMatch(top),
    otherMatches: rest.map(toParentCardMatch),
    facts: facts?.isTlevel ? facts : null,
  };

  try {
    const text = await provider.generateParentCard(input);
    if (isValidParentCard(text, input)) {
      return { cardText: text, source: 'ai' };
    }
    console.warn('[generateParentCard] AI output failed validation, using fallback');
  } catch (err) {
    console.error('[generateParentCard] AI provider failed, using fallback', err);
  }

  return { cardText: buildStaticFallbackCard(input), source: 'fallback' };
}
