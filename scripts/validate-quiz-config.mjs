// Sanity check for src/config/*: every CourseWeighting.courseId must exist
// in COURSES, ids must be unique, and every question needs at least one
// option. Run via `npm run validate:config`. Not a substitute for the
// Phase 3 ScoringEngine unit tests (ticket #12) -- this only checks the
// data is internally consistent, not that the algorithm is correct.
import { COURSES, QUESTIONS } from '../src/config/index.ts';

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

const courseIds = new Set(COURSES.map((c) => c.id));
if (courseIds.size !== COURSES.length) fail('Duplicate course id in COURSES');

const questionIds = new Set();
const optionIds = new Set();

for (const q of QUESTIONS) {
  if (questionIds.has(q.id)) fail(`Duplicate question id: ${q.id}`);
  questionIds.add(q.id);

  if (!q.options || q.options.length === 0) fail(`Question ${q.id} has no options`);

  for (const opt of q.options ?? []) {
    if (optionIds.has(opt.id)) fail(`Duplicate option id: ${opt.id}`);
    optionIds.add(opt.id);

    for (const w of opt.weights) {
      if (!courseIds.has(w.courseId)) {
        fail(`${q.id} / ${opt.id} weights unknown course id "${w.courseId}"`);
      }
      if (!(w.weight > 0)) {
        fail(`${q.id} / ${opt.id} weight for "${w.courseId}" must be a positive number`);
      }
    }
  }
}

if (process.exitCode) {
  console.error(`\nFAILED: config inconsistency found (see above).`);
} else {
  console.log(
    `OK: ${COURSES.length} courses, ${QUESTIONS.length} questions, ${optionIds.size} options -- all courseId references resolve.`,
  );
}
