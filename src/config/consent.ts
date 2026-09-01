/**
 * Email opt-in consent (ticket #25, FR9, NFR3). Versioned so a stored
 * opt-in always records which exact wording the student agreed to --
 * required by the legal briefing's marketing-to-minors caution, and what
 * makes the opt-in "unbundled" rather than a pre-ticked box buried in the
 * main flow.
 *
 * Bump CONSENT_VERSION (and keep the old text somewhere findable, e.g.
 * git history) any time NOTICE_TEXT changes -- existing rows keep
 * whatever version they recorded.
 */
export const CONSENT_VERSION = '2026-09-01-v1';

export const NOTICE_TEXT =
  "We'll only use your email to send a one-off reminder about your course match in a few weeks. " +
  'No other marketing, no sharing with third parties. You can unsubscribe at any time.';
