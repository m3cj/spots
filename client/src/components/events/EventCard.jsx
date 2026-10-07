import { Link } from 'react-router-dom';
import { PiArrowSquareOut, PiMapPin } from 'react-icons/pi';
import Pill from '@/components/ui/Pill';
import { formatEventWhen, formatPrice, isFree, splitCategorySlugs } from '@/utils/format';

const STATUS_LABELS = { cancelled: 'Cancelled', completed: 'Ended' };

/**
 * Event card — DESIGN-SYSTEM §8.3. The title is the stretched link to the event page; the venue and
 * "Book Now" links sit above it so they stay independently clickable without nesting anchors.
 * `categories` is the DB category list, used to turn the event's slugs into names.
 */
export default function EventCard({ event, categories = [], priority = false }) {
  const venue = event.spot;
  const names = splitCategorySlugs(event.categories).map(
    (slug) => categories.find((category) => category.slug === slug)?.name ?? slug,
  );
  const venueLine = venue ? [venue.name, venue.area].filter(Boolean).join(', ') : null;
  const statusLabel = STATUS_LABELS[event.status];

  return (
    <article className="press-card relative overflow-hidden rounded-md bg-mithila-card shadow-sm active:shadow-md">
      <div className="aspect-video bg-mithila-pill">
        {event.hero_img && (
          <img
            src={event.hero_img}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <p className="bg-mithila-pill px-4 py-2 text-[12px] font-semibold leading-none text-mithila-text">
        {formatEventWhen(event.event_date, event.start_time, event.end_time)}
      </p>

      <div className="space-y-2 p-4">
        <h3 className="text-[16px] font-bold leading-snug text-mithila-text">
          <Link to={`/event/${event.id}`} className="after:absolute after:inset-0 after:content-['']">
            {event.title}
          </Link>
        </h3>

        {venue && (
          <Link
            to={`/spot/${venue.id}`}
            className="relative z-card inline-flex min-h-[44px] items-center gap-1 text-caption text-mithila-muted hover:text-mithila-text"
          >
            <PiMapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sr-only">Venue: </span>
            {venueLine}
          </Link>
        )}

        <ul className="flex flex-wrap items-center gap-1.5">
          {statusLabel && (
            <li>
              <Pill className="!text-state-danger">{statusLabel}</Pill>
            </li>
          )}
          <li>
            {isFree(event.price) ? (
              <span className="inline-flex items-center rounded-pill bg-state-success px-2.5 py-1.5 text-tag text-white">
                Free
              </span>
            ) : (
              <Pill className="!text-mithila-text">{formatPrice(event.price)}</Pill>
            )}
          </li>
          {event.age_limit ? (
            <li>
              <Pill>{event.age_limit}+</Pill>
            </li>
          ) : null}
          {names.map((name) => (
            <li key={name}>
              <Pill>{name}</Pill>
            </li>
          ))}
        </ul>

        {event.booking_link && (
          <a
            href={event.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-card inline-flex min-h-[44px] items-center gap-1 text-button text-mithila-primary underline"
          >
            Book Now
            <PiArrowSquareOut aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
