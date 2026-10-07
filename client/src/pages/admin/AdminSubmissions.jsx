import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiCheck, PiPencil, PiX } from 'react-icons/pi';
import {
  approveSubmission,
  getAdminSubmissions,
  rejectSubmission,
} from '@/api/admin';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Tabs from '@/components/ui/Tabs';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/hooks/useToast';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES = {
  pending: 'bg-mithila-pill text-mithila-muted',
  approved: 'bg-state-success text-white',
  rejected: 'bg-state-danger text-white',
};

function SubmissionRow({ sub }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-mithila-border bg-mithila-card p-4 shadow-sm transition-colors hover:border-mithila-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/submissions/${sub.id}`}
              className="font-semibold text-mithila-text hover:text-mithila-primary"
            >
              {sub.name}
            </Link>
            <span className={`shrink-0 rounded-pill px-2.5 py-0.5 text-tag ${STATUS_STYLES[sub.status] ?? STATUS_STYLES.pending}`}>
              {sub.status}
            </span>
          </div>

          <p className="mt-1 text-caption text-mithila-muted">
            {[
              sub.category_slug,
              sub.best_time_to_visit,
              [sub.area, sub.city].filter(Boolean).join(', '),
              sub.lat != null && sub.lng != null ? `${Number(sub.lat).toFixed(4)}, ${Number(sub.lng).toFixed(4)}` : null,
            ].filter(Boolean).join(' · ')}
          </p>

          {sub.description && (
            <p className="mt-1.5 line-clamp-2 text-caption text-mithila-textSecondary">
              {sub.description}
            </p>
          )}

          {sub.reject_reason && (
            <p className="mt-1.5 text-caption text-state-danger">
              Rejection reason: {sub.reject_reason}
            </p>
          )}

          <p className="mt-2 text-[12px] text-mithila-muted">
            Submitted by: {sub.submitter?.display_name || sub.submitter?.email || 'Anonymous'} · {new Date(sub.created_at).toLocaleDateString()}
          </p>
        </div>

        {sub.image_url && (
          <img
            src={sub.image_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xs border border-mithila-border object-cover"
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-mithila-border/60 pt-3">
        <Button
          as={Link}
          to={`/admin/submissions/${sub.id}`}
          variant={sub.status === 'pending' ? 'primary' : 'ghost'}
          size="sm"
        >
          <PiPencil aria-hidden="true" className="mr-1.5 h-4 w-4" />
          {sub.status === 'pending' ? 'Review & Enrich' : 'View Details'}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSubmissions() {
  const [tab, setTab] = useState('pending');

  const { data, loading, error, reload } = useAsync(
    (signal) => getAdminSubmissions({ status: tab }, { signal }),
    [tab],
  );
  const submissions = data?.items ?? [];

  return (
    <div className="px-edge py-6">
      <div className="mb-5">
        <h1 className="font-handwritten text-display text-mithila-text">Submissions</h1>
        <p className="text-caption text-mithila-muted">Review, edit and approve community spot suggestions</p>
      </div>

      <Tabs
        label="Submission status"
        idPrefix="admin-subs"
        tabs={STATUS_TABS}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full rounded-md" />)}
        </div>
      )}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && submissions.length === 0 && (
        <EmptyState
          title={`No ${tab} submissions`}
          description={tab === 'pending' ? 'All clear! No submissions waiting for review.' : `No ${tab} submissions yet.`}
        />
      )}
      {!loading && submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionRow
              key={sub.id}
              sub={sub}
            />
          ))}
        </div>
      )}
    </div>
  );
}
