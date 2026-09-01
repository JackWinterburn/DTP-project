import { getEngagementStats } from '@/lib/dashboard/getEngagementStats';
import { DashboardStats } from '@/components/DashboardStats';

export const metadata = { title: 'Staff dashboard | Ada Course Finder (staff)' };

// This page reads live aggregate data on every request via the
// service-role client (see getEngagementStats.ts) -- it must never be
// statically prerendered at build time (no live Supabase connection is
// available in every environment this project is built in, and cached
// build-time stats would just be wrong the moment a poster gets scanned).
export const dynamic = 'force-dynamic';

/**
 * Read-only staff aggregate dashboard (tickets #26-28, FR10). Deliberately
 * un-authenticated for the same reason /staff/qr/{token} is (see that
 * page's comment): the func spec's MVP scope is explicitly "no user
 * accounts / login" and "no full staff admin UI, a read-only aggregate
 * view only" -- and everything this page shows is already an aggregate
 * count with no personal or individually-identifying data (FR10), so
 * there's nothing here a login would be protecting beyond what the URL
 * itself already isn't advertised outside Ada staff.
 */
export default async function StaffDashboardPage() {
  const stats = await getEngagementStats();

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold">Staff dashboard</h1>
        <p className="text-ada-grey mt-1 text-sm">
          Aggregate scan, completion and T-Level match counts per school poster. No individual quiz
          result is ever shown here.
        </p>
      </div>

      <DashboardStats stats={stats} />
    </main>
  );
}
