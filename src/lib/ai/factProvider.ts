import { COURSES } from '@/config';

export interface VerifiedCourseFacts {
  courseName: string;
  isTlevel: boolean;
  qualification: string | null;
  equivalent: string | null;
  entryRequirement: string | null;
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
 * As of the 2026-09-01 UI redesign, src/config/courses.ts carries real,
 * sourced facts rather than Phase 2's [PLACEHOLDER] markers -- but this
 * function still guards against a leaked placeholder marker reaching the
 * AI, since that's cheap insurance against a future content edit
 * reintroducing one (Risk R1: fact-locking only works if what's locked
 * in is real).
 */
export function getCourseFacts(courseId: string): VerifiedCourseFacts | null {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;

  const verified = (value: string | undefined) =>
    value && !value.startsWith('[PLACEHOLDER') ? value : null;

  return {
    courseName: course.name,
    isTlevel: course.isTlevel,
    qualification: verified(course.qualification),
    equivalent: verified(course.equivalent),
    entryRequirement: verified(course.entryRequirement),
    employerPartners: (course.employerPartners ?? []).filter((p) => !p.startsWith('[PLACEHOLDER')),
  };
}
