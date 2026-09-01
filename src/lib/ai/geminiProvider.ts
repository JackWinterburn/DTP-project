import type { AiProvider, ParentCardInput } from './aiProvider';
import { buildParentCardPrompt } from './promptBuilder';

const MODEL = 'gemini-2.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 8000;

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

/**
 * Concrete AiProvider (ticket #22) -- a plain REST fetch, not the
 * `@google/genai` SDK, so the whole server-side call is one small,
 * inspectable function for Section 4.3's documented snippet. The API key
 * is read from GEMINI_API_KEY (server-only env var, never NEXT_PUBLIC_*)
 * and never reaches the client (NFR7) -- this file only ever runs inside
 * a Route Handler.
 *
 * Callers should treat any thrown error (missing key, network failure,
 * timeout, empty response) as "AI unavailable" and fall back -- see
 * generateParentCard() in index.ts, which is the only place that decides
 * what to do about a failure. This class never falls back itself.
 */
export class GeminiProvider implements AiProvider {
  async generateParentCard(input: ParentCardInput): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = buildParentCardPrompt(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 250 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API responded ${res.status}`);
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        throw new Error('Gemini response had no text content');
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
}
