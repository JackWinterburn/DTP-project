import { describe, expect, it } from 'vitest';
import { ScoringEngine } from './scoringEngine';
import type { Course, Question, QuizAnswers } from '@/types/quiz';

/**
 * Unit tests for the scoring engine (ticket #12).
 *
 * "Test Case 1: All-equal quiz answers (tie-breaking behaviour)" is the
 * edge case named explicitly in Section 5.2 of the report -- see the
 * `tie-breaking` describe block below. The rest of this file exercises
 * FR3 (weighted scoring) and FR4 (visible, factual reasons) more broadly,
 * plus the malformed-input handling called out in Section 4.4.
 *
 * A small fixture config (2 courses, 2 questions) is used instead of the
 * real 5-course/8-question bank in src/config, so each test's expected
 * numbers are easy to hand-verify rather than re-deriving the real quiz's
 * arithmetic.
 */

const FIXTURE_COURSES: Course[] = [
  { id: 'course-a', name: 'Course A', isTlevel: false },
  { id: 'course-b', name: 'Course B', isTlevel: false },
];

const FIXTURE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Question one?',
    weightCategory: 'test',
    options: [
      {
        id: 'q1-a',
        label: 'Option favouring A',
        weights: [{ courseId: 'course-a', weight: 2 }],
      },
      {
        id: 'q1-b',
        label: 'Option favouring B',
        weights: [{ courseId: 'course-b', weight: 2 }],
      },
      {
        id: 'q1-neutral',
        label: 'Neutral option',
        weights: [],
      },
    ],
  },
  {
    id: 'q2',
    text: 'Question two?',
    weightCategory: 'test',
    options: [
      {
        id: 'q2-a',
        label: 'Option favouring A',
        weights: [{ courseId: 'course-a', weight: 1 }],
      },
      {
        id: 'q2-b',
        label: 'Option favouring B',
        weights: [{ courseId: 'course-b', weight: 1 }],
      },
    ],
  },
];

function engine() {
  return new ScoringEngine(1, FIXTURE_QUESTIONS, FIXTURE_COURSES);
}

describe('ScoringEngine.score() -- weighted matching (FR3)', () => {
  it('ranks the course whose options were consistently chosen first, at 100%', () => {
    const answers: QuizAnswers = { q1: 'q1-a', q2: 'q2-a' };
    const result = engine().score(answers);

    expect(result.matches[0]).toMatchObject({ courseId: 'course-a', scorePct: 100 });
    expect(result.matches[1]).toMatchObject({ courseId: 'course-b', scorePct: 0 });
  });

  it('normalises each course against its own maximum, not a shared 100% pool', () => {
    // course-a's own maximum is 2 (q1) + 1 (q2) = 3; course-b's is the
    // same shape (2 + 1 = 3). Picking q1-a (2 toward A) and q2-b (1
    // toward B) gives A a raw score of 2/3 of its own max (=> 67%) and B
    // 1/3 of its own max (=> 33%) -- each computed independently against
    // its own ceiling, which is why they don't sum to 100%.
    const answers: QuizAnswers = { q1: 'q1-a', q2: 'q2-b' };
    const result = engine().score(answers);
    const byId = Object.fromEntries(result.matches.map((m) => [m.courseId, m.scorePct]));

    expect(byId['course-a']).toBe(67);
    expect(byId['course-b']).toBe(33);
  });

  it('always returns every course, sorted descending by score', () => {
    const result = engine().score({ q1: 'q1-a', q2: 'q2-a' });
    expect(result.matches).toHaveLength(FIXTURE_COURSES.length);
    for (let i = 1; i < result.matches.length; i++) {
      expect(result.matches[i - 1].scorePct).toBeGreaterThanOrEqual(result.matches[i].scorePct);
    }
  });
});

describe('ScoringEngine.score() -- tie-breaking (Section 5.2 Test Case 1: all-equal quiz answers)', () => {
  it('breaks a tied score deterministically by courseId, not by declaration order', () => {
    // Both courses score 0% (every option below contributes nothing to
    // either course), so the ranking is decided entirely by the
    // tie-break rule.
    const symmetricEngine = new ScoringEngine(
      1,
      [
        {
          id: 'q1',
          text: 'Question one?',
          weightCategory: 'test',
          options: [{ id: 'q1-tie', label: 'Equal for both', weights: [] }],
        },
      ],
      [
        { id: 'zebra', name: 'Zebra Course', isTlevel: false },
        { id: 'alpha', name: 'Alpha Course', isTlevel: true },
      ],
    );

    const result = symmetricEngine.score({ q1: 'q1-tie' });

    expect(result.matches.map((m) => m.scorePct)).toEqual([0, 0]);
    // "alpha" sorts before "zebra" alphabetically, even though "zebra"
    // (and its T-Level) was declared first in the courses list -- proves
    // the tie-break is courseId-driven, not array order, and doesn't
    // quietly favour a T-Level over a BTEC just because of list position.
    expect(result.matches.map((m) => m.courseId)).toEqual(['alpha', 'zebra']);
  });

  it('is stable and reproducible across repeated calls with the same input', () => {
    const answers: QuizAnswers = { q1: 'q1-neutral', q2: 'q2-a' };
    const first = engine().score(answers);
    const second = engine().score(answers);
    expect(second.matches.map((m) => m.courseId)).toEqual(first.matches.map((m) => m.courseId));
  });
});

describe('ScoringEngine.score() -- reasons (FR4)', () => {
  it('gives a course zero reasons when nothing the student chose favoured it', () => {
    const result = engine().score({ q1: 'q1-a', q2: 'q2-a' });
    const courseB = result.matches.find((m) => m.courseId === 'course-b');
    expect(courseB?.reasons).toEqual([]);
  });

  it('quotes the actual question text and chosen option label, never inventing wording', () => {
    const result = engine().score({ q1: 'q1-a', q2: 'q2-a' });
    const courseA = result.matches.find((m) => m.courseId === 'course-a');
    expect(courseA?.reasons).toContain(
      'Because when asked "Question one?" you chose "Option favouring A".',
    );
    expect(courseA?.reasons.length).toBeLessThanOrEqual(2);
  });
});

describe('ScoringEngine.score() -- malformed input (Section 4.4)', () => {
  it('throws a clear error when a question is left unanswered', () => {
    expect(() => engine().score({ q1: 'q1-a' })).toThrow(/missing answer/i);
  });

  it('throws a clear error when an answer references an unknown option id', () => {
    expect(() => engine().score({ q1: 'not-a-real-option', q2: 'q2-a' })).toThrow(
      /unrecognised option/i,
    );
  });
});

describe('ScoringEngine -- result shape', () => {
  it('stamps the configured quizVersion and a unique share token per call', () => {
    const e = new ScoringEngine(7, FIXTURE_QUESTIONS, FIXTURE_COURSES);
    const answers: QuizAnswers = { q1: 'q1-a', q2: 'q2-a' };
    const first = e.score(answers);
    const second = e.score(answers);

    expect(first.quizVersion).toBe(7);
    expect(first.shareToken).not.toBe(second.shareToken);
    expect(first.shareToken).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
