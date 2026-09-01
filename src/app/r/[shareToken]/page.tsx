import type { Metadata } from 'next';
import { SharedResultView } from '@/components/SharedResultView';

export const metadata: Metadata = {
  title: 'Your matches | Ada Course Finder',
};

/** FR8: recovering a saved result via its unguessable share-token URL, no account needed. */
export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <SharedResultView shareToken={shareToken} />
    </main>
  );
}
