import { Link, useNavigate, useParams } from 'react-router-dom';
import { PiArrowLeft, PiArrowSquareOut, PiCalendar, PiClock, PiMapPin, PiMoney, PiUser } from 'react-icons/pi';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pill from '@/components/ui/Pill';
import { useAsync } from '@/hooks/useAsync';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';
import { formatEventWhen, formatPrice, formatTime, isFree, splitCategorySlugs } from '@/utils/format';
import { getEvent } from '@/api/public';

function EventDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="aspect-video w-full rounded-md" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-1/2" />
        ))}
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function MetaRow({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-2 text-body text-mithila-textSecondary">
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-mithila-muted" />
      <span>
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </li>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bySlug } = useCategories();
  const { data: event, loading, error, reload } = useAsync(
    (signal) => getEvent(id, { signal }),
    [id],
  );

  const venue = event?.spot;
  const categoryNames = event
    ? splitCategorySlugs(event.categories).map((slug) => bySlug.get(slug)?.name ?? slug)
    : [];

  useSeo({
    title: event ? event.title : 'Event',
    description: event?.description
      ? event.description.slice(0, 155)
      : `${event?.title ?? 'Event'} in Patna on SpotS.`,
    image: event?.hero_img ?? undefined,
    url: `${window.location.origin}/event/${id}`,
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
            {event ? event.title : loading ? '' : 'Event'}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        {loading && <EventDetailSkeleton />}

        {!loading && error && <ErrorState error={error} onRetry={reload} className="py-16" />}

        {!loading && !event && !error && (
          <EmptyState
            title="Event not found"
            description="This event may have been removed."
            action={{ label: 'Browse events', as: Link, to: '/events' }}
          />
        )}

        {!loading && event && (
          <article className="space-y-6">
            {/* Hero */}
            {event.hero_img && (
              <div className="aspect-video overflow-hidden rounded-md bg-mithila-pill">
                <img
                  src={event.hero_img}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Date strip */}
            <p className="inline-block rounded-pill bg-mithila-pill px-4 py-2 text-[13px] font-semibold text-mithila-text">
              {formatEventWhen(event.event_date, event.start_time, event.end_time)}
            </p>

            {/* Title */}
            <h1 className="font-handwritten text-display text-mithila-text">{event.title}</h1>

            {/* Tags */}
            {categoryNames.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {categoryNames.map((name) => (
                  <li key={name}>
                    <Pill>{name}</Pill>
                  </li>
                ))}
              </ul>
            )}

            {/* Meta list */}
            <ul className="space-y-2">
              {venue && (
                <MetaRow icon={PiMapPin} label="Venue">
                  <Link
                    to={`/spot/${venue.id}`}
                    className="text-mithila-primary hover:underline"
                  >
                    {[venue.name, venue.area].filter(Boolean).join(', ')}
                  </Link>
                </MetaRow>
              )}
              <MetaRow icon={PiCalendar} label="Date">
                {formatEventWhen(event.event_date, null)}
              </MetaRow>
              {event.start_time && (
                <MetaRow icon={PiClock} label="Time">
                  {formatTime(event.start_time)}
                  {event.end_time && ` – ${formatTime(event.end_time)}`}
                </MetaRow>
              )}
              <MetaRow icon={PiMoney} label="Price">
                {isFree(event.price) ? (
                  <span className="font-semibold text-state-success">Free</span>
                ) : (
                  formatPrice(event.price)
                )}
              </MetaRow>
              {event.age_limit && (
                <MetaRow icon={PiUser} label="Age limit">
                  {event.age_limit}+
                </MetaRow>
              )}
            </ul>

            {/* Description */}
            {event.description && (
              <section>
                <h2 className="text-section text-mithila-text">About this event</h2>
                <p className="mt-2 whitespace-pre-line text-body text-mithila-textSecondary">
                  {event.description}
                </p>
              </section>
            )}

            {/* Book Now CTA */}
            {event.booking_link && (
              <Button
                id="event-book-now"
                as="a"
                href={event.booking_link}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="mt-2 w-full"
              >
                Book Now
                <PiArrowSquareOut aria-hidden="true" className="ml-2 h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </Button>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
