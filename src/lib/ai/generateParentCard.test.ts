import { describe, expect, it, vi } from 'vitest';
import { generateParentCard } from './generateParentCard';
import type { AiProvider } from './aiProvider';
import type { CourseMatch } from '@/types/quiz';
import { COURSES } from '@/config';

const TOP_COURSE = COURSES[0];

const MATCHES: CourseMatch[] = [
  { courseId: TOP_COURSE.id, scorePct: 88, reasons: ['You said you enjoy building things.'] },
];

/**
 * "Test Case 5: Gemini API timeout -> fallback card served" (Section 5.2).
 *
 * generateParentCard() takes its AiProvider as an injectable parameter
 * specifically so this is testable without a real network call (Section
 * 3.7's DIP claim) -- these tests stand in for the real Gemini call with
 * a provider double that behaves like the real one does on a timeout: it
 * rejects (GeminiProvider aborts via AbortController and its `finally`
 * re-throws whatever the SDK threw -- see geminiProvider.ts).
 */
describe('generateParentCard() -- AI failure degrades to fallback (NFR6, Section 5.2 Test Case 5)', () => {
  it('serves the static fallback card when the AI provider times out', async () => {
    const timingOutProvider: AiProvider = {
      generateParentCard: () => Promise.reject(new Error('The operation was aborted.')),
    };

    const result = await generateParentCard(MATCHES, timingOutProvider);

    expect(result.source).toBe('fallback');
    expect(result.cardText).toContain(TOP_COURSE.name);
    expect(result.cardText.length).toBeGreaterThan(0);
  });

  it('serves the static fallback card when the AI provider throws any other error', async () => {
    const failingProvider: AiProvider = {
      generateParentCard: () => Promise.reject(new Error('404 model not found')),
    };

    const result = await generateParentCard(MATCHES, failingProvider);

    expect(result.source).toBe('fallback');
  });

  it('serves the static fallback card when the AI output fails validation (e.g. a leaked placeholder)', async () => {
    const badOutputProvider: AiProvider = {
      generateParentCard: () => Promise.resolve('[PLACEHOLDER] this is not a real card'),
    };

    const result = await generateParentCard(MATCHES, badOutputProvider);

    expect(result.source).toBe('fallback');
  });

  it('uses the AI provider output as-is when it succeeds and validates', async () => {
    const goodText = `Your child's top course match from the Ada Course Finder quiz is ${TOP_COURSE.name}, a strong 88% match based on their interests.`;
    const workingProvider: AiProvider = {
      generateParentCard: () => Promise.resolve(goodText),
    };

    const result = await generateParentCard(MATCHES, workingProvider);

    expect(result.source).toBe('ai');
    expect(result.cardText).toBe(goodText);
  });

  it('never throws for an AI/validation failure, even with no facts available', async () => {
    const provider: AiProvider = {
      generateParentCard: () => Promise.reject(new Error('network down')),
    };
    await expect(generateParentCard(MATCHES, provider)).resolves.toMatchObject({
      source: 'fallback',
    });
  });
});

describe('generateParentCard() -- programming errors still throw', () => {
  it('throws when called with no matches at all (a caller bug, not a runtime AI condition)', async () => {
    await expect(generateParentCard([], { generateParentCard: vi.fn() })).rejects.toThrow(
      /no matches/i,
    );
  });
});
