import { motion } from 'motion/react';
import { PiBookmarkSimple, PiBookmarkSimpleFill, PiHeart, PiHeartFill, PiNavigationArrow, PiShareNetwork } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { snap } from '@/utils/motion';
import { directionsUrl } from '@/utils/maps';

const ACTION =
  'press flex min-h-[44px] items-center justify-center gap-2 rounded-pill border border-mithila-border px-3 text-button hover:bg-mithila-pill';

// Pops the icon on change with the Snap preset (a transform-only micro-interaction).
function PopIcon({ active, on: On, off: Off }) {
  const Icon = active ? On : Off;
  return (
    <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={snap} className="flex">
      <Icon aria-hidden="true" className="h-5 w-5" />
    </motion.span>
  );
}

/** Like / save / share row (PRD §7.4). Anonymous taps open the sign-in prompt via the hook. */
export function SpotActionBar({ spot, pending, onLike, onBookmark, onShare }) {
  const { liked, bookmarked } = spot.viewer;

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        disabled={pending.like}
        className={`${ACTION} ${liked ? 'text-mithila-primary' : 'text-mithila-text'}`}
      >
        <PopIcon active={liked} on={PiHeartFill} off={PiHeart} />
        <span>
          {liked ? 'Liked' : 'Like'}
          <span className="sr-only">, {spot.like_count} likes</span>
          <span aria-hidden="true"> · {spot.like_count}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onBookmark}
        aria-pressed={bookmarked}
        disabled={pending.bookmark}
        className={`${ACTION} ${bookmarked ? 'text-mithila-primary' : 'text-mithila-text'}`}
      >
        <PopIcon active={bookmarked} on={PiBookmarkSimpleFill} off={PiBookmarkSimple} />
        {bookmarked ? 'Saved' : 'Save'}
      </button>

      <button type="button" onClick={onShare} className={`${ACTION} text-mithila-text`}>
        <PiShareNetwork aria-hidden="true" className="h-5 w-5" />
        Share
      </button>
    </div>
  );
}

/** Directions (secondary) + Explore on Map (the one primary action) — the sticky modal footer. */
export function SpotCtas({ spot }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        as="a"
        variant="secondary"
        icon={PiNavigationArrow}
        href={directionsUrl(spot)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Directions
        <span className="sr-only"> (opens in a new tab)</span>
      </Button>
      <Button as={Link} to={`/?spot=${spot.id}`}>
        Explore on Map
      </Button>
    </div>
  );
}
