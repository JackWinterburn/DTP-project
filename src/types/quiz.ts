/**
 * Shared quiz/scoring types.
 *
 * Mirrors the UML class diagram in the technical report (Section 3.3):
 * Question *-- AnswerOption *-- CourseWeighting, and ScoringEngine reads
 * Question[] to produce a Result of CourseMatch[].
 *
 * These are pulled forward from ticket #9 (Phase 3) because the versioned
 * question bank / course config authored for ticket #7 needs a type to be
 * written against. The actual ScoringEngine implementation (score(),
 * generateReasons(), unit tests) is still Phase 3 -- tickets #10-#12.
 */

/** A single quiz question, shown one-per-screen (FR2). */
export interface Question {
  id: string;
  text: string;
  /** Groups questions by what they measure, e.g. 'hands-on' | 'creative' | 'data' | 'teamwork'. Informational only -- scoring reads weights, not this field. */
  weightCategory: string;
  options: AnswerOption[];
}

/** One selectable answer for a Question. */
export interface AnswerOption {
  id: string;
  label: string;
  weights: CourseWeighting[];
}

/** How strongly picking an AnswerOption should push toward a given course. */
export interface CourseWeighting {
  courseId: string;
  /** Positive integer. Larger = stronger pull toward this course. */
  weight: number;
}

/**
 * A course/pathway the quiz can recommend. `id`/`name`/`isTlevel` mirror
 * the `courses` table; everything else is display-only content for the
 * results UI (ticket: UI redesign, 2026-09-01) and is deliberately
 * optional -- ScoringEngine only ever reads `id`, so a minimal fixture
 * (see scoringEngine.test.ts) stays valid without these fields.
 */
export interface Course {
  id: string;
  name: string;
  isTlevel: boolean;
  /** Single emoji shown as the course's badge in the results UI. */
  badge?: string;
  /** Short subject/theme line shown under the course name, e.g. "Digital Production, Design & Development". */
  tagline?: string;
  /** 2-3 sentence plain-language description of the course. */
  description?: string;
  /** Example roles/careers this course leads toward. */
  careers?: string[];
  /** Formal qualification name, e.g. "T Level in Digital Production, Design & Development". */
  qualification?: string;
  /** What the qualification is worth, e.g. "3 A-Levels (up to 168 UCAS points)". */
  equivalent?: string;
  /** Where this is taught. Only set for Ada's own named pathways -- never invented for a generic comparison course Ada doesn't actually offer. */
  campus?: string;
  /** Entry requirements in plain language. */
  entryRequirement?: string;
  /** Link to learn more. Only set for Ada's own named pathways, for the same reason as `campus`. */
  url?: string;
  /** Short callout note shown alongside the course, e.g. an apprenticeship's post-18 timing. */
  note?: string;
  /** T-Level highlight bullets shown in the expandable T-Level panel (FR5). */
  tLevelFacts?: string[];
  /** Named employer/industry partners -- used by both the T-Level panel and the AI parent-card fact-provider. */
  employerPartners?: string[];
  /** Standard parent FAQ shown alongside a T-Level match and folded into the parent summary card. */
  tlevelFaq?: { q: string; a: string }[];
}

/** One ranked match on the results page (FR3, FR4). */
export interface CourseMatch {
  courseId: string;
  scorePct: number;
  /** Plain-language reasons behind the score (FR4) -- never a bare percentage. */
  reasons: string[];
}

/** The scored outcome of a completed quiz. Mirrors the `results` table's `matches` column plus its persistence fields. */
export interface Result {
  shareToken: string;
  quizVersion: number;
  matches: CourseMatch[];
}

/** One selected AnswerOption id per Question id, keyed by Question.id. Must cover every Question in QUESTIONS before scoring -- ScoringEngine.score() throws otherwise. */
export type QuizAnswers = Record<string, string>;

/** Background-save status for a just-scored Result (Phase 5 persistence). 'pending' while the save is in flight, 'saved' once the server-issued shareToken is in hand, 'unsaved' if there's no session or the save failed. */
export type PersistState = 'pending' | 'saved' | 'unsaved';
