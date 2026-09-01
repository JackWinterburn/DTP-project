import Link from 'next/link';
import { QrCodeCard } from '@/components/QrCodeCard';

export const metadata = { title: 'Poster QR code | Ada Course Finder (staff)' };

/**
 * Staff-facing QR code generator (ticket #20, FR1). Deliberately minimal
 * and un-authenticated for the MVP: per the Architecture doc's "deliberate
 * simplifications" (no CMS) and the func spec's explicit MVP scope ("no
 * full teacher/staff-facing admin UI, a read-only aggregate view only"),
 * creating/managing qr_codes rows happens directly in the Supabase table
 * editor -- Ada's own low tech-ops comfort (SWOT) makes that a better fit
 * than a bespoke admin form for a handful of per-school tokens. This page
 * only turns an existing token into a printable poster image, pointing
 * at the stable /q/{token} redirect (never the token's raw UUID id).
 */
export default async function StaffQrPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Poster QR code</h1>
        <p className="text-ada-grey mt-1 text-sm">
          Print this for the poster. It always points at the same address, so replacing a damaged
          poster with a fresh printout needs no changes anywhere else (Risk R5).
        </p>
      </div>

      <QrCodeCard token={token} />

      <Link href="/q" className="text-ada-green text-sm hover:underline">
        Preview what scanning it opens →
      </Link>
    </main>
  );
}
