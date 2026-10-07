import { Link } from 'react-router-dom';
import { PiArrowLeft, PiClock, PiMapPin } from 'react-icons/pi';
import { getMySubmissions } from '@/api/public';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useSeo } from '@/hooks/useSeo';

const STATUS_BADGE = {
  pending: { label: 'Pending review', className: 'bg-mithila-pill text-mithila-text' },
  approved: { label: 'Approved', className: 'bg-state-success text-white' },
  rejected: { label: 'Rejected', className: 'bg-state-danger text-white' },
};

function MySubmissionCard({ sub }) {
  const badge = STATUS_BADGE[sub.status] ?? STATUS_BADGE.pending;

  return (
    <li className="rounded-md border border-mithila-border bg-mithila-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {sub.image_url ? (
            <img
              src={sub.image_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xs border border-mithila-border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xs bg-mithila-pill text-mithila-muted">
              <PiMapPin aria-hidden="true" className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-body font-bold text-mithila-text">{sub.name}</h3>
            <p className="mt-0.5 text-caption text-mithila-muted">
              {[sub.category_slug, sub.area, sub.city].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-mithila-muted">
              <PiClock aria-hidden="true" className="h-3.5 w-3.5" />
              <span>{new Date(sub.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <span className={`shrink-0 rounded-pill px-2.5 py-1 text-tag font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {sub.description && (
        <p className="line-clamp-2 text-caption text-mithila-textSecondary">
          {sub.description}
        </p>
      )}

      {sub.status === 'rejected' && sub.reject_reason && (
        <div className="rounded-xs border border-state-danger/30 bg-state-danger/10 p-2.5 text-caption text-mithila-text">
          <strong className="text-state-danger font-semibold">Curator note: </strong>
          {sub.reject_reason}
        </div>
      )}
    </li>
  );
}

export default function MySubmissionsPage() {
  useSeo({ title: 'My Submissions', description: 'Track the status of your spot suggestions in Patna.' });
  const { data, loading, error, reload } = useAsync(
    (signal) => getMySubmissions({}, { signal }),
    [],
  );

  const submissions = data?.items ?? [];

  return (
    <div className="min-h-full bg-mithila-canvas">
      {/* Sticky header bar */}
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-3">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3">
          <Link
            to="/profile"
            aria-label="Back to profile"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <h1 className="font-handwritten text-display text-mithila-text">My Submissions</h1>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-md bg-mithila-card p-4 shadow-sm space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && submissions.length === 0 && (
          <EmptyState
            title="No submissions yet"
            description="Know a hidden gem? Share it with the community."
            action={{ label: 'Suggest a spot', as: Link, to: '/suggest' }}
          />
        )}

        {!loading && submissions.length > 0 && (
          <ul className="space-y-3">
            {submissions.map((sub) => (
              <MySubmissionCard key={sub.id} sub={sub} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
