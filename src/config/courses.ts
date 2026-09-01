import type { Course } from '@/types/quiz';

/**
 * Pilot course list (ticket #8).
 *
 * IDs are stable strings, not database UUIDs, matching the `courses` table
 * PK in the schema migration (supabase/migrations/..._core_schema.sql) and
 * the CourseWeighting.courseId values in questions.ts.
 *
 * Scope note: "T-Level Digital plus comparison courses (BTEC, Creative
 * Media etc.)" per ticket #8 -- Ada's own T-Level offer, plus the kind of
 * post-16 options a Year 10-11 student would genuinely be weighing it
 * against, so the scoring rubric has to differentiate for real rather than
 * always pointing at the flagship course.
 */
export const COURSES: Course[] = [
  {
    id: 'tlevel-digital',
    name: 'Digital Production, Design & Development T-Level',
    isTlevel: true,
  },
  { id: 'tlevel-support', name: 'Digital Support Services T-Level', isTlevel: true },
  { id: 'btec-computing', name: 'BTEC Level 3 Computing', isTlevel: false },
  { id: 'creative-media', name: 'BTEC Level 3 Creative Media Production', isTlevel: false },
  { id: 'business-enterprise', name: 'BTEC Level 3 Business', isTlevel: false },
];

/**
 * T-Level context panel facts (FR5) -- shown only when a student's top
 * match is a T-Level.
 *
 * Risk R1 mitigation in practice: this is the "vetted constants file" the
 * AI parent-card prompt (Phase 6) and the T-Level panel are fact-locked
 * to. The specific figures below are PILOT PLACEHOLDERS, not verified Ada
 * facts -- UCAS points, entry requirements and employer partner names
 * change and must be confirmed by Ada staff before this goes live (this is
 * exactly the Risk R8 update-surface the single-file design is meant to
 * make easy to review). Ship nothing derived from this file to a real
 * student without that sign-off.
 */
export interface TlevelFacts {
  courseId: string;
  ucasPointsHeadline: string;
  universityAcceptance: string;
  employerPartners: string[];
}

export const TLEVEL_FACTS: TlevelFacts[] = [
  {
    courseId: 'tlevel-digital',
    ucasPointsHeadline:
      '[PLACEHOLDER -- confirm current UCAS tariff with Ada admissions before launch]',
    universityAcceptance:
      '[PLACEHOLDER -- confirm accepted-equivalent-to-3-A-Levels wording and named partner universities with Ada admissions]',
    employerPartners: [
      '[PLACEHOLDER -- confirm current industry placement partners with Ada industry partnerships team]',
    ],
  },
  {
    courseId: 'tlevel-support',
    ucasPointsHeadline:
      '[PLACEHOLDER -- confirm current UCAS tariff with Ada admissions before launch]',
    universityAcceptance:
      '[PLACEHOLDER -- confirm accepted-equivalent-to-3-A-Levels wording and named partner universities with Ada admissions]',
    employerPartners: [
      '[PLACEHOLDER -- confirm current industry placement partners with Ada industry partnerships team]',
    ],
  },
];
