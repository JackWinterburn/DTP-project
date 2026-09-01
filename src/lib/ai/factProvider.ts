import { COURSES, TLEVEL_FACTS } from '@/config';

const PLACEHOLDER_PREFIX = '[PLACEHOLDER';

export interface VerifiedCourseFacts {
  courseName: string;
  isTlevel: boolean;
  ucasPointsHeadline: string | null;
  universityAcceptance: string | null;
  employerPartners: string[];
}

/**
 * The "abstract fact-provider" referenced in Section 3.7's Dependency
 * Inversion bullet -- the parent-card generator (and its prompt) reads
 * facts only through this function, never by importing src/config
 * directly. That's what makes "the vetted constants file" swappable
 * later (a real Ada content API, say) without touching the prompt
 * builder or the route.
 *
 * Placeholder facts from Phase 2 (`[PLACEHOLDER ...]`) are filtered out
 * here, not passed through -- the AI must never see bracket-placeholder
 * text as if it were a real fact to rephrase (Risk R1: fact-locking only
 * works if what's locked in is real). A T-Level with only placeholder
 * facts still returns isTlevel: true with the fields as null/[], so
 * generateParentCard can fall back to a generic sentence instead.
 */
export function getCourseFacts(courseId: string): VerifiedCourseFacts | null {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;

  const facts = TLEVEL_FACTS.find((f) => f.courseId === courseId);
  const verified = (value: string | undefined) =>
    value && !value.startsWith(PLACEHOLDER_PREFIX) ? value : null;

  return {
    courseName: course.name,
    isTlevel: course.isTlevel,
    ucasPointsHeadline: verified(facts?.ucasPointsHeadline),
    universityAcceptance: verified(facts?.universityAcceptance),
    employerPartners: (facts?.employerPartners ?? []).filter(
      (p) => !p.startsWith(PLACEHOLDER_PREFIX),
    ),
  };
}
