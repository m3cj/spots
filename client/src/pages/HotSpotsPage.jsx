import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PiArrowLeft, PiHeartFill } from 'react-icons/pi';
import { getHotSpots } from '@/api/public';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';
import { settle } from '@/utils/motion';

const MEDAL_EMOJIS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const TOP_BORDER_STYLES = {
  1: 'border-l-[3px] border-l-medal-gold',
  2: 'border-l-[3px] border-l-medal-silver',
  3: 'border-l-[3px] border-l-medal-bronze',
};

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[22px] leading-none" role="img" aria-label={`Rank ${rank}`}>
        {MEDAL_EMOJIS[rank]}
        <span className="sr-only">Rank {rank}</span>
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-mithila-pill text-[13px] font-semibold text-mithila-textSecondary">
      {rank}
    </span>
  );
}

function HotSpotRow({ spot, rank, category, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...settle, delay: index * 0.04 }}
    >
      <Link
        to={`/spot/${spot.id}`}
        className={`press-card flex items-center gap-3.5 rounded-sm bg-mithila-card px-4 py-3 shadow-sm active:shadow-md ${
          TOP_BORDER_STYLES[rank] ?? 'border-l-[3px] border-l-transparent'
        }`}
      >
        <RankBadge rank={rank} />

        {/* Hero thumbnail: square 64x64px (--radius-sm) per DESIGN-SYSTEM §8.2 */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-mithila-pill">
          {spot.hero_img && (
            <img
              src={spot.hero_img}
              alt=""
              loading={rank <= 3 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-handwritten text-[16px] font-bold leading-snug text-mithila-text">{spot.name}</p>
          <p className="mt-0.5 font-sans text-[12px] text-mithila-muted">
            {[spot.area, category?.name].filter(Boolean).join(' · ')}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-mithila-pill px-3 py-1.5 text-mithila-primary">
          <PiHeartFill aria-hidden="true" className="h-4 w-4 text-mithila-primary" />
          <span className="font-sans text-[14px] font-semibold" aria-label={`${spot.like_count} likes`}>
            {spot.like_count}
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

function HotSpotRowSkeleton() {
  return (
    <li className="flex items-center gap-3.5 rounded-sm border-l-[3px] border-l-transparent bg-mithila-card px-4 py-3 shadow-sm">
      <Skeleton className="h-8 w-8 rounded-pill" />
      <Skeleton className="h-16 w-16 rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-7 w-16 rounded-pill" />
    </li>
  );
}

export default function HotSpotsPage() {
  const { data: spots, loading, error, reload } = useAsync(getHotSpots, []);
  const { bySlug } = useCategories();
  useSeo({
    title: 'HotSpots',
    description: 'The most-liked spots in Patna, ranked by the community. See what locals love most.',
  });
  return (
    <div className="min-h-full bg-mithila-canvas">
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-3">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3">
          <Link
            to="/spots"
            aria-label="Back to spots"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <h1 className="font-handwritten text-display text-mithila-text">HotSpots</h1>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        <p className="mb-6 text-body text-mithila-textSecondary">
          The most-loved spots in Patna, ranked by community likes.
        </p>

        {loading && (
          <ul className="space-y-3">
            {Array.from({ length: 8 }, (_, i) => (
              <HotSpotRowSkeleton key={i} />
            ))}
          </ul>
        )}

        {!loading && error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && (!spots || spots.length === 0) && (
          <EmptyState
            title="No hot spots yet"
            description="Be the first to like a spot in Patna!"
            action={{ label: 'Explore spots', as: Link, to: '/spots' }}
          />
        )}

        {!loading && spots && spots.length > 0 && (
          <ul className="space-y-3">
            {spots.map((spot, index) => (
              <HotSpotRow
                key={spot.id}
                spot={spot}
                rank={index + 1}
                category={bySlug.get(spot.category_slug)}
                index={index}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
