import { GoogleGenAI } from '@google/genai';
import type { AiProvider, ParentCardInput } from './aiProvider';
import { buildParentCardPrompt } from './promptBuilder';

const MODEL = 'gemini-3.5-flash-lite';
const TIMEOUT_MS = 8000;

/**
 * Concrete AiProvider (ticket #22) -- uses Google's official `@google/genai`
 * SDK rather than a hand-rolled REST call (an earlier version of this file
 * used plain `fetch`, but that stopped working in practice; the SDK is
 * Google's maintained client and the one their own docs point to). The API
 * key is read from GEMINI_API_KEY (server-only env var, never NEXT_PUBLIC_*)
 * and never reaches the client (NFR7) -- this file only ever runs inside a
 * Route Handler.
 *
 * Callers should treat any thrown error (missing key, network failure,
 * timeout, empty response, or an SDK `ApiError`) as "AI unavailable" and
 * fall back -- see generateParentCard() in index.ts, which is the only
 * place that decides what to do about a failure. This class never falls
 * back itself.
 */
export class GeminiProvider implements AiProvider {
  async generateParentCard(input: ParentCardInput): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = buildParentCardPrompt(input);
    const ai = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 250,
          abortSignal: controller.signal,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Gemini response had no text content');
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
}
