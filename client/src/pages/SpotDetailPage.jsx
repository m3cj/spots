import { useNavigate, useParams } from 'react-router-dom';
import { PiArrowLeft, PiMapPin } from 'react-icons/pi';
import SpotDetailBody from '@/components/spots/SpotDetailBody';
import SpotDetailSkeleton from '@/components/spots/SpotDetailSkeleton';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';
import { useSpotDetail } from '@/hooks/useSpotDetail';

export default function SpotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { spot, loading, error, reload, pending, toggleLike, toggleBookmark, share } = useSpotDetail(id);
  const { bySlug } = useCategories();
  useSeo({
    title: spot ? spot.name : 'Spot',
    description: spot?.description
      ? spot.description.slice(0, 155)
      : `Discover ${spot?.name ?? 'this spot'} in Patna on SpotS.`,
    image: spot?.hero_img ?? undefined,
    url: `${window.location.origin}/spot/${id}`,
  });
  return (
    <div className="min-h-full bg-mithila-canvas">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-2">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-body font-semibold text-mithila-text">
            {spot ? spot.name : loading ? '' : 'Spot'}
          </p>
          {spot && (
            <Button
              as="a"
              href={`/?spot=${id}`}
              variant="ghost"
              size="sm"
              className="ml-auto shrink-0"
            >
              <PiMapPin aria-hidden="true" className="mr-1 h-4 w-4" />
              Map
            </Button>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        {loading && <SpotDetailSkeleton />}

        {!loading && error && (
          <ErrorState
            error={error}
            onRetry={reload}
            className="py-16"
          />
        )}

        {!loading && spot && (
          <SpotDetailBody
            spot={spot}
            category={bySlug.get(spot.category_slug)}
            detail={{ pending, toggleLike, toggleBookmark, share }}
            variant="page"
          />
        )}
      </main>
    </div>
  );
}
