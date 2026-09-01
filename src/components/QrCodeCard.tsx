import { headers } from 'next/headers';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Resolves the deployed origin so the QR encodes a real, absolute URL --
 * NEXT_PUBLIC_SITE_URL when set (the real domain to use once Risk R4's
 * mitigation lands: an ada.ac.uk subdomain, not *.vercel.app, so school
 * firewalls that already trust Ada's domain don't block the poster), else
 * falls back to the current request's own host so this still works
 * correctly on Vercel preview deployments.
 */
async function resolveOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  const h = await headers();
  const host = h.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function QrCodeCard({ token }: { token: string }) {
  const origin = await resolveOrigin();
  const url = `${origin}/q/${encodeURIComponent(token)}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-neutral-300 p-6 dark:border-neutral-700">
      <div className="rounded-lg bg-white p-4">
        <QRCodeSVG value={url} size={220} level="M" />
      </div>
      <p className="text-center text-sm break-all text-neutral-600 dark:text-neutral-400">{url}</p>
    </div>
  );
}
