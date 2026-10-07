import { useEffect, useRef, useState } from 'react';
import { getEvents } from '@/api/public';
import EventCard from '@/components/events/EventCard';
import EventCardSkeleton from '@/components/events/EventCardSkeleton';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Tabs from '@/components/ui/Tabs';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';

const PAGE_SIZE = 12;
const STATUS_TABS = [
  { value: 'upcoming,ongoing', label: 'Upcoming' },
  { value: 'completed', label: 'Past' },
];

export default function EventsPage() {
  const { categories } = useCategories();
  const [tab, setTab] = useState('upcoming,ongoing');
  useSeo({
    title: 'Events',
    description: 'Upcoming events in Patna — concerts, festivals, food fairs, cultural shows and more.',
  });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const prevTab = useRef(tab);

  useEffect(() => {
    if (prevTab.current !== tab) {
      prevTab.current = tab;
      setPage(1);
      setItems([]);
    }
  }, [tab]);

  useEffect(() => {
    const ac = new AbortController();
    const isFirst = page === 1;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    getEvents({ status: tab, page, pageSize: PAGE_SIZE }, { signal: ac.signal })
      .then(({ items: newItems, hasMore: more }) => {
        setItems((prev) => (isFirst ? newItems : [...prev, ...newItems]));
        setHasMore(more);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab]);

  return (
    <div className="min-h-full bg-mithila-canvas">
      {/* Header */}
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-3">
        <div className="mx-auto max-w-screen-xl">
          <h1 className="mb-3 font-handwritten text-display text-mithila-text">Events in Patna</h1>
          <Tabs
            label="Event status"
            idPrefix="events"
            tabs={STATUS_TABS}
            value={tab}
            onChange={(value) => { setTab(value); }}
          />
        </div>
      </div>

      <main
        id="events-panel"
        role="tabpanel"
        aria-labelledby={`events-tab-${tab}`}
        className="mx-auto max-w-screen-xl px-edge py-6"
      >
        {loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <ErrorState error={error} onRetry={() => { setPage(1); setItems([]); }} />
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title={tab.includes('upcoming') ? 'No upcoming events' : 'No past events'}
            description={
              tab.includes('upcoming')
                ? 'Check back soon — events are added regularly.'
                : 'Past events will appear here.'
            }
          />
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  categories={categories}
                  priority={index < 4}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  id="events-load-more"
                  variant="secondary"
                  loading={loadingMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
