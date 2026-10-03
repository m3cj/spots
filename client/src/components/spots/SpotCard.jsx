import { Link } from 'react-router-dom';
import { PiHeartFill } from 'react-icons/pi';
import Pill from '@/components/ui/Pill';
import { bestTimeLabel } from '@/utils/format';

/**
 * Spot card — DESIGN-SYSTEM §8.1 / §14. The whole card is one link to the deep-link page; pass `onClick`
 * (and preventDefault) to open the detail modal instead. `category` is the DB category row for the spot.
 * Set `priority` for cards above the fold so their image loads eagerly.
 */
export default function SpotCard({ spot, category, priority = false, onClick }) {
  const meta = [spot.area, bestTimeLabel(spot.best_time_to_visit)].filter(Boolean).join(' · ');
  const tags = spot.tags ?? [];

  return (
    <Link
      to={`/spot/${spot.id}`}
      onClick={onClick}
      className="press-card group block overflow-hidden rounded-md bg-mithila-card shadow-sm active:shadow-md"
    >
      <div className="relative aspect-[3/2] bg-mithila-pill">
        {spot.hero_img && (
          <img
            src={spot.hero_img}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        {category && (
          <span className="absolute left-2 top-2 rounded-pill bg-mithila-scrim px-2.5 py-1.5 text-tag text-white">
            {category.name}
          </span>
        )}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-pill bg-mithila-scrim px-2.5 py-1.5 text-tag text-white">
          <PiHeartFill aria-hidden="true" className="h-3 w-3" />
          <span aria-label={`${spot.like_count} likes`}>{spot.like_count}</span>
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-handwritten text-spot-name text-mithila-text group-active:text-mithila-primary">
          {spot.name}
        </h3>
        {meta && <p className="text-meta text-mithila-muted">{meta}</p>}
        {spot.description && (
          <p className="line-clamp-2 text-caption text-mithila-textSecondary">{spot.description}</p>
        )}
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 4).map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
