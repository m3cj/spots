import { getDashboardStats } from '@/api/admin';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';

function StatCard({ label, value, loading, subtitle }) {
  return (
    <div className="rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
      {loading ? (
        <>
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="font-handwritten text-[32px] leading-none text-mithila-primary">{value ?? 0}</p>
          <p className="mt-1.5 text-caption font-semibold text-mithila-text">{label}</p>
          {subtitle && <p className="text-[11px] text-mithila-muted">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, loading, error, reload } = useAsync(getDashboardStats, []);

  return (
    <div className="px-edge py-6">
      <div className="mb-6">
        <h1 className="font-handwritten text-display text-mithila-text">Dashboard</h1>
        <p className="text-caption text-mithila-muted">Real-time curation metrics and activity counters</p>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total spots" value={stats?.total_spots} loading={loading} subtitle="All database entries" />
        <StatCard label="Active spots" value={stats?.active_spots} loading={loading} subtitle="Live on public feed" />
        <StatCard label="Draft spots" value={stats?.draft_spots} loading={loading} subtitle="Unpublished or in progress" />
        <StatCard label="Pending suggestions" value={stats?.pending_submissions} loading={loading} subtitle="Waiting for curator triage" />
        <StatCard label="Active events" value={stats?.active_events} loading={loading} subtitle="Upcoming or ongoing" />
        <StatCard label="Registered users" value={stats?.total_users} loading={loading} subtitle="Google sign-in accounts" />
      </div>
    </div>
  );
}
