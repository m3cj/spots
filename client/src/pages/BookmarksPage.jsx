import { Link } from 'react-router-dom';
import { PiArrowLeft } from 'react-icons/pi';
import { getBookmarks } from '@/api/public';
import SpotCard from '@/components/spots/SpotCard';
import SpotCardSkeleton from '@/components/spots/SpotCardSkeleton';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';
import { useAsync } from '@/hooks/useAsync';

export default function BookmarksPage() {
  const { bySlug } = useCategories();
  useSeo({ title: 'Saved Spots', description: 'Your bookmarked spots in Patna.' });
  const { data, loading, error, reload } = useAsync(
    (signal) => getBookmarks({}, { signal }),
    [],
  );

  const spots = data?.items ?? [];

  return (
    <div className="min-h-full bg-mithila-canvas">
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-3">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3">
          <Link
            to="/profile"
            aria-label="Back to profile"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <h1 className="font-handwritten text-display text-mithila-text">Saved spots</h1>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        {loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && spots.length === 0 && (
          <EmptyState
            title="No saved spots yet"
            description="Tap the bookmark icon on any spot to save it here."
            action={{ label: 'Explore spots', as: Link, to: '/spots' }}
          />
        )}

        {!loading && spots.length > 0 && (
          <ul className="grid gap-4 lg:grid-cols-2">
            {spots.map((spot, index) => (
              <li key={spot.id}>
                <SpotCard
                  spot={spot}
                  category={bySlug.get(spot.category_slug)}
                  priority={index < 4}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
