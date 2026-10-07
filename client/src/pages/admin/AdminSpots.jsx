import { Link, useNavigate } from 'react-router-dom';
import { PiPencil, PiPlus, PiTrash } from 'react-icons/pi';
import { deleteAdminSpot, getAdminSpots } from '@/api/admin';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/hooks/useToast';

function SpotRow({ spot, onDelete }) {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-mithila-border hover:bg-mithila-pill/40 transition-colors">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          {spot.hero_img ? (
            <img
              src={spot.hero_img}
              alt=""
              className="h-10 w-12 shrink-0 rounded-xs border border-mithila-border object-cover"
            />
          ) : (
            <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xs bg-mithila-pill text-[11px] font-semibold text-mithila-muted">
              No photo
            </div>
          )}
          <div>
            <Link
              to={`/admin/spots/${spot.id}`}
              className="font-semibold text-mithila-text hover:text-mithila-primary"
            >
              {spot.name}
            </Link>
            <p className="text-[12px] text-mithila-muted">{spot.category_slug}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-caption text-mithila-textSecondary">
        {[spot.area, spot.city].filter(Boolean).join(', ') || '—'}
      </td>
      <td className="py-3">
        <span
          className={`rounded-pill px-2.5 py-1 text-tag ${
            spot.status === 'active'
              ? 'bg-state-success text-white'
              : spot.status === 'archived'
              ? 'bg-state-danger/80 text-white'
              : 'bg-mithila-pill text-mithila-muted'
          }`}
        >
          {spot.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-right">
        <button
          type="button"
          onClick={() => navigate(`/admin/spots/${spot.id}`)}
          aria-label={`Edit ${spot.name}`}
          className="press mr-2 inline-flex h-9 w-9 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
        >
          <PiPencil aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(spot)}
          aria-label={`Delete ${spot.name}`}
          className="press inline-flex h-9 w-9 items-center justify-center rounded-pill text-state-danger hover:bg-mithila-pill"
        >
          <PiTrash aria-hidden="true" className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export default function AdminSpots() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    (signal) => getAdminSpots({}, { signal }),
    [],
  );
  const spots = data?.items ?? [];

  const handleDelete = async (spot) => {
    if (!window.confirm(`Delete "${spot.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminSpot(spot.id);
      toast.success('Spot deleted');
      reload();
    } catch (err) {
      toast.error('Delete failed', { subtitle: err.message });
    }
  };

  return (
    <div className="px-edge py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-handwritten text-display text-mithila-text">Spots</h1>
          <p className="text-caption text-mithila-muted">Manage discovery entries, locations and media</p>
        </div>
        <Button
          id="admin-spots-new"
          variant="primary"
          onClick={() => navigate('/admin/spots/new')}
        >
          <PiPlus aria-hidden="true" className="mr-1 h-4 w-4" />
          New spot
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && spots.length === 0 && (
        <EmptyState
          title="No spots yet"
          description="Create your first curated spot."
          action={{
            label: 'New spot',
            onClick: () => navigate('/admin/spots/new'),
          }}
        />
      )}

      {!loading && spots.length > 0 && (
        <div className="overflow-x-auto rounded-md bg-mithila-card shadow-sm border border-mithila-border">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-mithila-border bg-mithila-bg/50">
                <th className="py-2.5 pl-4 text-left text-caption font-semibold text-mithila-muted">
                  Name
                </th>
                <th className="py-2.5 text-left text-caption font-semibold text-mithila-muted">
                  Location
                </th>
                <th className="py-2.5 text-left text-caption font-semibold text-mithila-muted">
                  Status
                </th>
                <th className="py-2.5 pr-4 text-right text-caption font-semibold text-mithila-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {spots.map((spot) => (
                <SpotRow key={spot.id} spot={spot} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
