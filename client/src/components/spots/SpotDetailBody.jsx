import { PiClock, PiEye, PiHeartFill, PiMapPin, PiPhone } from 'react-icons/pi';
import CategoryBadge from '@/components/spots/CategoryBadge';
import { SpotActionBar } from '@/components/spots/SpotActions';
import SpotGallery from '@/components/spots/SpotGallery';
import Pill from '@/components/ui/Pill';
import { bestTimeLabel } from '@/utils/format';
import { formatAddress } from '@/utils/maps';

// Hero first, then the curated gallery, without repeating the hero if it is also a gallery row.
function galleryImages(spot) {
  const seen = new Set();
  const images = [];
  const add = (url, caption) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push({ url, caption });
    }
  };
  add(spot.hero_img);
  (spot.spot_images ?? []).forEach((image) => add(image.image_url, image.caption));
  return images;
}

/**
 * Everything on the spot page (PRD §7.4) shared by the modal and the deep-link page. In `page` mode the spot
 * name is the screen's single <h1>; in the modal the Modal header already carries it, so sections drop a level.
 */
export default function SpotDetailBody({ spot, category, detail, variant = 'modal' }) {
  const isPage = variant === 'page';
  const SectionHeading = isPage ? 'h2' : 'h3';
  const address = formatAddress(spot);
  const timeLabel = bestTimeLabel(spot.best_time_to_visit);
  const tags = spot.tags ?? [];

  return (
    <div className="space-y-5">
      <SpotGallery images={galleryImages(spot)} name={spot.name} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={category} />
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-mithila-pill px-3 py-1.5 text-tag text-mithila-text">
            <PiHeartFill aria-hidden="true" className="h-3.5 w-3.5 text-mithila-primary" />
            <span className="sr-only">Likes: </span>
            {spot.like_count}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-mithila-pill px-3 py-1.5 text-tag text-mithila-muted">
            <PiEye aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="sr-only">Views: </span>
            {spot.views}
          </span>
        </div>

        {isPage && <h1 className="font-handwritten text-display text-mithila-text">{spot.name}</h1>}

        <ul className="space-y-1.5 text-body text-mithila-textSecondary">
          {address && (
            <li className="flex items-start gap-2">
              <PiMapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-mithila-muted" />
              {address}
            </li>
          )}
          {timeLabel && (
            <li className="flex items-center gap-2">
              <PiClock aria-hidden="true" className="h-5 w-5 shrink-0 text-mithila-muted" />
              Best time to visit: {timeLabel}
            </li>
          )}
          {spot.contacts && (
            <li className="flex items-center gap-2">
              <PiPhone aria-hidden="true" className="h-5 w-5 shrink-0 text-mithila-muted" />
              {spot.contacts}
            </li>
          )}
        </ul>
      </div>

      <SpotActionBar
        spot={spot}
        pending={detail.pending}
        onLike={detail.toggleLike}
        onBookmark={detail.toggleBookmark}
        onShare={detail.share}
      />

      {spot.description && (
        <section>
          <SectionHeading className="text-section text-mithila-text">About</SectionHeading>
          <p className="mt-1.5 whitespace-pre-line text-body text-mithila-textSecondary">{spot.description}</p>
        </section>
      )}

      {spot.direction && (
        <section>
          <SectionHeading className="text-section text-mithila-text">How to get there</SectionHeading>
          <p className="mt-1.5 whitespace-pre-line text-body text-mithila-textSecondary">{spot.direction}</p>
        </section>
      )}

      {tags.length > 0 && (
        <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <Pill>{tag}</Pill>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
