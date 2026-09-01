import { COURSES, QUESTIONS, QUIZ_VERSION } from '@/config';
import type {
  AnswerOption,
  Course,
  CourseMatch,
  Question,
  QuizAnswers,
  Result,
} from '@/types/quiz';

/**
 * The scoring engine (ticket #10/#11, the critical feature -- Section 4.2
 * of the report). Matches the ScoringEngine class in the UML class diagram
 * (Section 3.3): a `quizVersion`, a public `score()`, and the private
 * `normalise()` / `generateReasons()` helpers it calls.
 *
 * Pure and synchronous by design (see src/lib/scoring/README.md): never
 * fetches data, persists a result, or calls the AI API. Runs identically
 * client-side (per the architecture: "scoring runs client-side ... no
 * database call needed") and server-side, since it only reads the
 * versioned config in src/config.
 */
export class ScoringEngine {
  readonly quizVersion: number;
  private readonly questions: Question[];
  private readonly courses: Course[];

  constructor(
    quizVersion: number = QUIZ_VERSION,
    questions: Question[] = QUESTIONS,
    courses: Course[] = COURSES,
  ) {
    this.quizVersion = quizVersion;
    this.questions = questions;
    this.courses = courses;
  }

  /**
   * Score a completed quiz and return a full Result, including a freshly
   * generated share token (per the UML diagram's `score(answers) Result`).
   * `answers` must have exactly one selected option id per question --
   * throws on a missing or unrecognised answer rather than guessing, so a
   * bug in the quiz UI (Phase 4) fails loudly instead of shipping a
   * silently-wrong result.
   */
  score(answers: QuizAnswers): Result {
    const selections = this.resolveSelections(answers);
    const rawScores = this.sumRawWeights(selections);
    const percentages = this.normalise(rawScores);

    const matches: CourseMatch[] = this.courses
      .map((course) => ({
        courseId: course.id,
        scorePct: percentages.get(course.id) ?? 0,
        reasons: this.generateReasons(course.id, selections),
      }))
      // Descending by score; ties broken by courseId (alphabetical), not
      // by declaration order -- so a tie never quietly favours whichever
      // course happens to be listed first (e.g. the flagship T-Level).
      // This is Test Case 1 in Section 5.2 (all-equal quiz answers).
      .sort((a, b) => b.scorePct - a.scorePct || a.courseId.localeCompare(b.courseId));

    return {
      shareToken: this.generateShareToken(),
      quizVersion: this.quizVersion,
      matches,
    };
  }

  /** Resolves each answered optionId to its Question/AnswerOption pair, validating completeness. */
  private resolveSelections(answers: QuizAnswers): { question: Question; option: AnswerOption }[] {
    return this.questions.map((question) => {
      const optionId = answers[question.id];
      if (!optionId) {
        throw new Error(`Missing answer for question "${question.id}"`);
      }
      const option = question.options.find((o) => o.id === optionId);
      if (!option) {
        throw new Error(`Unrecognised option "${optionId}" for question "${question.id}"`);
      }
      return { question, option };
    });
  }

  private sumRawWeights(
    selections: { question: Question; option: AnswerOption }[],
  ): Map<string, number> {
    const raw = new Map<string, number>(this.courses.map((c) => [c.id, 0]));
    for (const { option } of selections) {
      for (const w of option.weights) {
        raw.set(w.courseId, (raw.get(w.courseId) ?? 0) + w.weight);
      }
    }
    return raw;
  }

  /**
   * Converts raw weight sums into 0-100 percentages, each normalised
   * against that course's own theoretical maximum (the score it would get
   * if every answer had been the strongest possible pick for it) -- so a
   * course only reachable via a few small weights isn't unfairly capped
   * relative to one that appears strongly in every question.
   */
  private normalise(rawScores: Map<string, number>): Map<string, number> {
    const percentages = new Map<string, number>();
    for (const course of this.courses) {
      const maxPossible = this.questions.reduce((sum, q) => {
        const best = Math.max(
          0,
          ...q.options.map((o) => o.weights.find((w) => w.courseId === course.id)?.weight ?? 0),
        );
        return sum + best;
      }, 0);
      const raw = rawScores.get(course.id) ?? 0;
      const pct = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
      percentages.set(course.id, Math.min(100, Math.max(0, pct)));
    }
    return percentages;
  }

  /**
   * Reasons behind one course's score (FR4: visible reasons, never a bare
   * percentage). Every reason directly quotes a question the student
   * actually answered and the option they actually chose -- nothing is
   * paraphrased or inferred, so a reason can never misstate what the
   * student said (the same fact-locking principle Risk R1 applies to the
   * AI parent card, applied here too).
   */
  private generateReasons(
    courseId: string,
    selections: { question: Question; option: AnswerOption }[],
  ): string[] {
    const MAX_REASONS = 2;
    return selections
      .map(({ question, option }) => ({
        question,
        option,
        weight: option.weights.find((w) => w.courseId === courseId)?.weight ?? 0,
      }))
      .filter((s) => s.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_REASONS)
      .map(
        ({ question, option }) =>
          `Because when asked "${question.text}" you chose "${option.label}".`,
      );
  }

  private generateShareToken(): string {
    return globalThis.crypto.randomUUID();
  }
}
