import type { VerifiedCourseFacts } from './factProvider';

export interface ParentCardMatch {
  courseName: string;
  scorePct: number;
  reasons: string[];
}

export interface ParentCardInput {
  topMatch: ParentCardMatch;
  otherMatches: ParentCardMatch[];
  /** Only set when topMatch is a T-Level with at least one verified (non-placeholder) fact. */
  facts: VerifiedCourseFacts | null;
}

/**
 * The "swappable AI-provider interface" from Section 3.7's Dependency
 * Inversion bullet. generateParentCard() (see index.ts) depends on this
 * interface, not on GeminiProvider directly -- the documented fallback
 * to GPT-4o mini (Architecture §2.1) means writing one new class that
 * implements this and passing it in, nothing else changes.
 */
export interface AiProvider {
  generateParentCard(input: ParentCardInput): Promise<string>;
}
