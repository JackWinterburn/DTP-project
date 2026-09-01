import type { Metadata } from 'next';
import { QuizFlow } from '@/components/QuizFlow';

export const metadata: Metadata = {
  title: 'Find Your Path | Ada Course Finder',
};

/**
 * QR poster entry (FR1) -- /q/{token}. The token identifies which
 * school/poster the scan came from; capturing it into a persisted
 * session is Phase 5 (ticket #17), not this page's job.
 */
export default async function QrQuizPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <QuizFlow qrToken={token} />
    </main>
  );
}
