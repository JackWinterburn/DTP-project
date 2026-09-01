import type { Question } from '@/types/quiz';

/**
 * Versioned question bank + course weighting config (ticket #7, FR3
 * input). Rewritten 2026-09-01 alongside courses.ts for the UI redesign
 * -- same 5 courses' worth of differentiation as before, in the tone of
 * the original hackathon prototype's question bank (old-hackathon-
 * prototype branch, survey.html) but written fresh against this
 * project's actual course set (tlevel-digital / apprenticeship /
 * btec-computing / creative-media / business-enterprise), not a literal
 * port of the prototype's different pathway names.
 *
 * QUIZ_VERSION bumped 1 -> 2: the rubric materially changed (course set
 * and every question), so historic results (recorded against v1) stay
 * correctly attributed to the old rubric rather than silently
 * reinterpreted (Risk R6 mitigation, see the original doc comment this
 * replaces).
 *
 * Course IDs used in weights must match src/config/courses.ts. Weights
 * are positive integers; omitting a course from an option's weights means
 * that option contributes nothing toward that course.
 */
export const QUIZ_VERSION = 2;

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: "When you're given a problem to solve, what's your instinct?",
    weightCategory: 'work-style',
    options: [
      {
        id: 'q1-a',
        label: 'Break it down with logic and data',
        weights: [
          { courseId: 'btec-computing', weight: 3 },
          { courseId: 'tlevel-digital', weight: 1 },
        ],
      },
      {
        id: 'q1-b',
        label: "Think about who's affected and why",
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q1-c',
        label: 'Sketch out what it could look like',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q1-d',
        label: 'Just start building and figure it out',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q2',
    text: 'Which of these sounds most like you?',
    weightCategory: 'self-image',
    options: [
      {
        id: 'q2-a',
        label: 'I love working things out logically',
        weights: [{ courseId: 'btec-computing', weight: 3 }],
      },
      {
        id: 'q2-b',
        label: "I'm into how businesses and people work",
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q2-c',
        label: "I'm a visual person — design gets me",
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q2-d',
        label: 'I want to write code and ship real things',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q3',
    text: 'What kind of career excites you most?',
    weightCategory: 'career-interest',
    options: [
      {
        id: 'q3-a',
        label: 'Software developer, data analyst or engineer',
        weights: [
          { courseId: 'btec-computing', weight: 2 },
          { courseId: 'tlevel-digital', weight: 2 },
        ],
      },
      {
        id: 'q3-b',
        label: 'Marketing, business analyst or entrepreneur',
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q3-c',
        label: 'Video editor, designer or content creator',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q3-d',
        label: 'Web engineer, cybersecurity or database roles',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 2 },
        ],
      },
    ],
  },
  {
    id: 'q4',
    text: 'How do you feel about a 45-day work placement as part of your course?',
    weightCategory: 'placement',
    options: [
      {
        id: 'q4-a',
        label: 'Yes — real-world experience is everything',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 3 },
        ],
      },
      {
        id: 'q4-b',
        label: 'Sounds good, but I want classroom learning too',
        weights: [
          { courseId: 'business-enterprise', weight: 1 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
      {
        id: 'q4-c',
        label: "I'd rather focus on coursework and a portfolio",
        weights: [
          { courseId: 'creative-media', weight: 2 },
          { courseId: 'btec-computing', weight: 1 },
        ],
      },
      {
        id: 'q4-d',
        label: "I'm not fussed either way",
        weights: [
          { courseId: 'btec-computing', weight: 1 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q5',
    text: 'Would you rather earn money while you study, or focus full-time on learning?',
    weightCategory: 'earning',
    options: [
      {
        id: 'q5-a',
        label: 'Earn while I learn — 100%',
        weights: [{ courseId: 'apprenticeship', weight: 4 }],
      },
      {
        id: 'q5-b',
        label: 'Full-time study, then a job',
        weights: [
          { courseId: 'tlevel-digital', weight: 1 },
          { courseId: 'btec-computing', weight: 1 },
          { courseId: 'creative-media', weight: 1 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
      {
        id: 'q5-c',
        label: 'Either works for me',
        weights: [
          { courseId: 'tlevel-digital', weight: 1 },
          { courseId: 'apprenticeship', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q6',
    text: 'Which project sounds most exciting to you?',
    weightCategory: 'project-type',
    options: [
      {
        id: 'q6-a',
        label: 'Building and launching a working web application',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 2 },
        ],
      },
      {
        id: 'q6-b',
        label: 'Designing something that helps a business solve a real problem',
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q6-c',
        label: 'Creating a video, animation or design campaign',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q6-d',
        label: "Analysing data to find a pattern no one's noticed",
        weights: [{ courseId: 'btec-computing', weight: 3 }],
      },
    ],
  },
  {
    id: 'q7',
    text: 'How important is going to university straight after sixth form?',
    weightCategory: 'university',
    options: [
      {
        id: 'q7-a',
        label: 'Very — I want a clear route to a good university',
        weights: [
          { courseId: 'tlevel-digital', weight: 2 },
          { courseId: 'btec-computing', weight: 2 },
        ],
      },
      {
        id: 'q7-b',
        label: "I'm open to it but not set on it",
        weights: [
          { courseId: 'creative-media', weight: 2 },
          { courseId: 'business-enterprise', weight: 1 },
        ],
      },
      {
        id: 'q7-c',
        label: "I'd rather go straight into a career or apprenticeship",
        weights: [
          { courseId: 'apprenticeship', weight: 3 },
          { courseId: 'tlevel-digital', weight: 1 },
        ],
      },
      {
        id: 'q7-d',
        label: "I haven't decided yet",
        weights: [
          { courseId: 'business-enterprise', weight: 1 },
          { courseId: 'creative-media', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'q8',
    text: 'Pick the phrase that sounds most like you:',
    weightCategory: 'identity',
    options: [
      {
        id: 'q8-a',
        label: 'I want to build things people actually use',
        weights: [
          { courseId: 'tlevel-digital', weight: 3 },
          { courseId: 'apprenticeship', weight: 1 },
        ],
      },
      {
        id: 'q8-b',
        label: 'I want to understand people and solve problems for them',
        weights: [{ courseId: 'business-enterprise', weight: 3 }],
      },
      {
        id: 'q8-c',
        label: 'I want to make things look and feel amazing',
        weights: [{ courseId: 'creative-media', weight: 3 }],
      },
      {
        id: 'q8-d',
        label: 'I want to understand how systems work at a deep level',
        weights: [{ courseId: 'btec-computing', weight: 3 }],
      },
    ],
  },
];
