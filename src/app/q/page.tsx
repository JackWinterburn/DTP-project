import type { Metadata } from 'next';
import { QuizFlow } from '@/components/QuizFlow';

export const metadata: Metadata = {
  title: 'Find Your Path | Ada Course Finder',
};

/** Organic (non-QR) entry -- FR1: the quiz works with no token, e.g. reached via a shared link. */
export default function OrganicQuizPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <QuizFlow qrToken={null} />
    </main>
  );
}
