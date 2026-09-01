import type { Question } from '@/types/quiz';

/**
 * Versioned question bank + course weighting config (ticket #7, FR3 input).
 *
 * Single reviewed source of truth for the scoring rubric (Risk R8
 * mitigation) -- the ScoringEngine (Phase 3) reads this and produces
 * nothing else. Bump QUIZ_VERSION whenever the questions or weights
 * change; `results.quiz_version` records which version produced a given
 * result, so historic results stay explainable after a quiz update
 * (Risk R6 mitigation in the risk register).
 *
 * Course IDs used in weights must match src/config/courses.ts. Weights
 * are positive integers; omitting a course from an option's weights means
 * that option contributes nothing toward that course.
 */
export const QUIZ_VERSION = 1;

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Which of these sounds most like a good day at work to you?',
    weightCategory: 'work-style',
    options: [
      {
        id: 'q1-a',
        label: 'Building or fixing something hands-on',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'tlevel-support', weight: 2 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
      {
        id: 'q1-b',
        label: 'Designing how something looks and feels',
        weights: [
          { courseId: 'creative-media', weight: 3 },
          { courseId: 'tlevel-digital', weight: 1 },
        ],
      },
      {
        id: 'q1-c',
        label: 'Solving a logic or data puzzle',
        weights: [
          { courseId: 'btec-computing', weight: 3 },
          { courseId: 'tlevel-digital', weight: 2 },
        ],
      },
      {
        id: 'q1-d',
        label: 'Helping a team stay organised',
        weights: [
          { courseId: 'business-enterprise', weight: 3 },
          { courseId: 'tlevel-support', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q2',
    text: "When something breaks, like a laptop or an app, what's your instinct?",
    weightCategory: 'problem-solving',
    options: [
      {
        id: 'q2-a',
        label: 'Try to fix it myself, step by step',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'tlevel-support', weight: 2 },
        ],
      },
      {
        id: 'q2-b',
        label: 'Look up how other people have solved it',
        weights: [
          { courseId: 'btec-computing', weight: 2 },
          { courseId: 'tlevel-support', weight: 2 },
        ],
      },
      {
        id: 'q2-c',
        label: "Ask someone who's good at that kind of thing",
        weights: [
          { courseId: 'tlevel-support', weight: 3 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
      {
        id: 'q2-d',
        label: 'Get frustrated and move on to something else',
        weights: [
          { courseId: 'creative-media', weight: 1 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q3',
    text: 'Which subject do you find yourself looking forward to most?',
    weightCategory: 'subject-interest',
    options: [
      {
        id: 'q3-a',
        label: 'Computer Science / Programming',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'btec-computing', weight: 2 },
        ],
      },
      {
        id: 'q3-b',
        label: 'Art, Media or Design',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q3-c',
        label: 'Business Studies',
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q3-d',
        label: 'IT / Digital Skills (general)',
        weights: [
          { courseId: 'tlevel-support', weight: 3 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q4',
    text: 'How do you feel about working on the same project for weeks, improving it bit by bit?',
    weightCategory: 'persistence',
    options: [
      {
        id: 'q4-a',
        label: 'I like that -- I enjoy perfecting something',
        weights: [
          { courseId: 'tlevel-digital', weight: 2 },
          { courseId: 'creative-media', weight: 2 },
        ],
      },
      {
        id: 'q4-b',
        label: 'I prefer shorter tasks with a clear, quick finish',
        weights: [
          { courseId: 'tlevel-support', weight: 2 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
      {
        id: 'q4-c',
        label: 'Depends on the project',
        weights: [{ courseId: 'btec-computing', weight: 1 }],
      },
      {
        id: 'q4-d',
        label: "I'd rather work on lots of different things",
        weights: [
          { courseId: 'business-enterprise', weight: 2 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q5',
    text: 'Picture your ideal work placement. What does it involve?',
    weightCategory: 'placement-preference',
    options: [
      {
        id: 'q5-a',
        label: 'Writing and testing code for a real product',
        weights: [{ courseId: 'tlevel-digital', weight: 3 }],
      },
      {
        id: 'q5-b',
        label: 'Helping people solve tech problems day-to-day',
        weights: [{ courseId: 'tlevel-support', weight: 3 }],
      },
      {
        id: 'q5-c',
        label: 'Creating videos, graphics or content',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q5-d',
        label: 'Working with a team on a business project',
        weights: [
          { courseId: 'business-enterprise', weight: 3 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q6',
    text: 'How do you prefer to learn something new?',
    weightCategory: 'learning-style',
    options: [
      {
        id: 'q6-a',
        label: 'Trial and error -- I like figuring it out myself',
        weights: [
          { courseId: 'tlevel-digital', weight: 2 },
          { courseId: 'tlevel-support', weight: 1 },
        ],
      },
      {
        id: 'q6-b',
        label: 'Following clear steps and checking my work as I go',
        weights: [
          { courseId: 'btec-computing', weight: 2 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
      {
        id: 'q6-c',
        label: 'Watching someone else do it first',
        weights: [
          { courseId: 'tlevel-support', weight: 2 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
      {
        id: 'q6-d',
        label: 'Working it out with a group',
        weights: [
          { courseId: 'business-enterprise', weight: 2 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q7',
    text: 'Which of these would you enjoy explaining to someone else?',
    weightCategory: 'communication-strength',
    options: [
      {
        id: 'q7-a',
        label: 'How an app or website actually works underneath',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
      {
        id: 'q7-b',
        label: 'How to set up or fix a device',
        weights: [{ courseId: 'tlevel-support', weight: 3 }],
      },
      {
        id: 'q7-c',
        label: 'How you made something look good',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q7-d',
        label: "How you'd pitch an idea to a group",
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
    ],
  },
  {
    id: 'q8',
    text: "What's most important to you in a future job?",
    weightCategory: 'career-values',
    options: [
      {
        id: 'q8-a',
        label: 'Building things that lots of people actually use',
        weights: [
          { courseId: 'tlevel-digital', weight: 2 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
      {
        id: 'q8-b',
        label: 'Helping people directly, one at a time',
        weights: [{ courseId: 'tlevel-support', weight: 3 }],
      },
      {
        id: 'q8-c',
        label: 'Being creative every day',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q8-d',
        label: 'Leading projects and working with clients',
        weights: [
          { courseId: 'business-enterprise', weight: 3 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
    ],
  },
];
