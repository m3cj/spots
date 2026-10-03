import { useRef } from 'react';
import { PiClock, PiHeartFill, PiMapPin, PiNavigationArrow } from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import { bestTimeLabel } from '@/utils/format';
import { directionsUrl, formatAddress } from '@/utils/maps';

/**
 * Pin preview (PRD §7.3): hero, like count (display only), address, best time, tags, then Get Directions / View.
 * The page behind stays interactive. The last spot is kept while the sheet animates out so it doesn't go blank.
 */
export default function MapBottomSheet({ spot, category, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastSpot = useRef(spot);
  if (spot) lastSpot.current = spot;
  const shown = spot ?? lastSpot.current;

  if (!shown) return null;

  const timeLabel = bestTimeLabel(shown.best_time_to_visit);
  const address = formatAddress(shown);
  const tags = shown.tags ?? [];

  const footer = (
    <div className="grid grid-cols-2 gap-3">
      <Button
        as="a"
        variant="secondary"
        icon={PiNavigationArrow}
        href={directionsUrl(shown)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Directions
        <span className="sr-only"> (opens in a new tab)</span>
      </Button>
      <Button onClick={() => navigate(`/spot/${shown.id}`, { state: { backgroundLocation: location } })}>View</Button>
    </div>
  );

  return (
    <BottomSheet open={Boolean(spot)} onClose={onClose} label={`${shown.name} preview`} footer={footer}>
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-sm bg-mithila-pill">
          {shown.hero_img && (
            <img src={shown.hero_img} alt="" decoding="async" className="h-full w-full object-cover" />
          )}
          {category && (
            <span className="absolute left-2 top-2 rounded-pill bg-mithila-scrim px-2.5 py-1.5 text-tag text-white">
              {category.name}
            </span>
          )}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-pill bg-mithila-scrim px-2.5 py-1.5 text-tag text-white">
            <PiHeartFill aria-hidden="true" className="h-3 w-3" />
            <span aria-label={`${shown.like_count} likes`}>{shown.like_count}</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-section text-mithila-text">{shown.name}</h2>
          {address && (
            <p className="flex items-start gap-1.5 text-caption text-mithila-muted">
              <PiMapPin aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
              {address}
            </p>
          )}
          {timeLabel && (
            <p className="flex items-center gap-1.5 text-caption text-mithila-muted">
              <PiClock aria-hidden="true" className="h-4 w-4 shrink-0" />
              Best time: {timeLabel}
            </p>
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}
