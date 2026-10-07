import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  PiArrowRight,
  PiCaretDown,
  PiFlameFill,
  PiFunnel,
  PiMagnifyingGlass,
  PiX,
} from 'react-icons/pi';
import { getSpotFacets, getSpots } from '@/api/public';
import SpotCard from '@/components/spots/SpotCard';
import SpotCardSkeleton from '@/components/spots/SpotCardSkeleton';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useCategories } from '@/hooks/useCategories';
import { useSeo } from '@/hooks/useSeo';
import { settle } from '@/utils/motion';

function HotSpotsBanner() {
  return (
    <Link
      to="/spots/hotspots"
      className="press-card group mb-6 flex items-center justify-between gap-4 rounded-md border border-mithila-border bg-mithila-card p-4 shadow-sm hover:border-mithila-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-mithila-pill text-[22px]">
          <PiFlameFill aria-hidden="true" className="h-6 w-6 text-mithila-secondary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-handwritten text-[18px] font-bold text-mithila-text">
              Patna's HotSpots
            </span>
            <span className="rounded-pill bg-mithila-pill px-2 py-0.5 font-sans text-tag font-semibold text-mithila-primary">
              Top 10
            </span>
          </div>
          <p className="mt-0.5 truncate font-sans text-caption text-mithila-muted">
            The most-loved places ranked by community likes
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 font-sans text-button font-semibold text-mithila-primary group-hover:underline">
        <span>Leaderboard</span>
        <PiArrowRight aria-hidden="true" className="h-4 w-4" />
      </div>
    </Link>
  );
}

const PAGE_SIZE = 12;

const BEST_TIME_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'day', label: 'Daytime' },
  { value: 'night', label: 'Night' },
  { value: 'anytime', label: 'Anytime' },
];

function FilterPill({ label, value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`press shrink-0 rounded-pill border px-4 py-2 text-tag transition-colors ${
        selected
          ? 'border-mithila-primary bg-mithila-primary text-white font-medium'
          : 'border-mithila-border bg-mithila-card text-mithila-textSecondary hover:border-mithila-primary hover:text-mithila-text'
      }`}
    >
      {label}
    </button>
  );
}

function SelectFilter({ id, label, value, onChange, options }) {
  return (
    <div className="relative min-w-[130px] flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="press h-10 w-full appearance-none rounded-pill border border-mithila-border bg-mithila-card pl-3.5 pr-8 text-[14px] text-mithila-text focus:outline-none focus:ring-2 focus:ring-mithila-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <PiCaretDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mithila-muted"
      />
    </div>
  );
}

export default function SpotsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, bySlug } = useCategories();

  useSeo({
    title: 'Spots',
    description: 'Browse hand-picked cafés, heritage sites, parks, ghats, bazaars and hidden gems across India.',
  });

  // Filters read from URL params
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [bestTime, setBestTime] = useState(searchParams.get('time') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Facets from API
  const [facets, setFacets] = useState({ cities: [], areas: [], pincodes: [], by_city: {} });

  useEffect(() => {
    getSpotFacets()
      .then((res) => {
        if (res) setFacets(res);
      })
      .catch(() => {});
  }, []);

  // Pagination & items
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search
  const [query, setQuery] = useState(search);
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (categorySlug) params.set('category', categorySlug);
    if (city) params.set('city', city);
    if (area) params.set('area', area);
    if (pincode) params.set('pincode', pincode);
    if (bestTime) params.set('time', bestTime);
    setSearchParams(params, { replace: true });
  }, [query, categorySlug, city, area, pincode, bestTime, setSearchParams]);

  // Reset page when active filters change
  const activeFilters = useMemo(
    () => ({ q: query, category: categorySlug, city, area, pincode, time: bestTime }),
    [query, categorySlug, city, area, pincode, bestTime],
  );

  const filterKey = JSON.stringify(activeFilters);
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
      setItems([]);
    }
  }, [filterKey]);

  // Fetch spots
  useEffect(() => {
    const ac = new AbortController();
    const isFirst = page === 1;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    const params = { page, pageSize: PAGE_SIZE, ...activeFilters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);

    getSpots(params, { signal: ac.signal })
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
  }, [page, filterKey, activeFilters]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setCategorySlug('');
    setCity('');
    setArea('');
    setPincode('');
    setBestTime('');
  }, []);

  // Filter options narrowed by selected city
  const cityOptions = useMemo(() => {
    const list = facets.cities || [];
    return [{ value: '', label: 'All Cities' }, ...list.map((c) => ({ value: c, label: c }))];
  }, [facets.cities]);

  const areaOptions = useMemo(() => {
    let list = facets.areas || [];
    if (city && facets.by_city?.[city]?.areas) {
      list = facets.by_city[city].areas;
    }
    return [{ value: '', label: 'All Areas' }, ...list.map((a) => ({ value: a, label: a }))];
  }, [city, facets]);

  const pincodeOptions = useMemo(() => {
    let list = facets.pincodes || [];
    if (city && facets.by_city?.[city]?.pincodes) {
      list = facets.by_city[city].pincodes;
    }
    return [{ value: '', label: 'All Pincodes' }, ...list.map((p) => ({ value: p, label: p }))];
  }, [city, facets]);

  const hasActiveFilters = Boolean(query || categorySlug || city || area || pincode || bestTime);

  return (
    <div className="min-h-full bg-mithila-canvas">
      {/* Page header */}
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-3 shadow-sm">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <PiMagnifyingGlass
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-mithila-muted"
              />
              <input
                id="spots-search-input"
                name="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search spots, areas, tags…"
                aria-label="Search spots"
                className="h-11 w-full rounded-pill border border-mithila-border bg-mithila-card pl-10 pr-4 text-[16px] text-mithila-text placeholder:text-mithila-muted focus:outline-none focus:ring-2 focus:ring-mithila-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="press absolute right-3 top-1/2 -translate-y-1/2 text-mithila-muted"
                >
                  <PiX aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              type="button"
              id="spots-filter-toggle"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="spots-filter-panel"
              className={`press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border transition-colors ${
                hasActiveFilters
                  ? 'border-mithila-primary bg-mithila-primary text-white shadow-sm'
                  : 'border-mithila-border bg-mithila-card text-mithila-textSecondary'
              }`}
            >
              <PiFunnel aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">Filters</span>
            </button>
          </div>

          {/* Filter dropdowns panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                id="spots-filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={settle}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2.5 pt-3 sm:grid-cols-4">
                  <SelectFilter
                    id="spots-city"
                    label="City"
                    value={city}
                    onChange={(val) => {
                      setCity(val);
                      setArea('');
                      setPincode('');
                    }}
                    options={cityOptions}
                  />
                  <SelectFilter
                    id="spots-area"
                    label="Area"
                    value={area}
                    onChange={setArea}
                    options={areaOptions}
                  />
                  <SelectFilter
                    id="spots-pincode"
                    label="Pincode"
                    value={pincode}
                    onChange={setPincode}
                    options={pincodeOptions}
                  />
                  <SelectFilter
                    id="spots-best-time"
                    label="Best time"
                    value={bestTime}
                    onChange={setBestTime}
                    options={BEST_TIME_OPTIONS}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Removable Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-mithila-muted font-medium">Filtered by:</span>
              {query && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  "{query}"
                  <button type="button" onClick={() => setSearch('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categorySlug && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  Category: {bySlug.get(categorySlug)?.name || categorySlug}
                  <button type="button" onClick={() => setCategorySlug('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  City: {city}
                  <button type="button" onClick={() => setCity('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {area && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  Area: {area}
                  <button type="button" onClick={() => setArea('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {pincode && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  PIN: {pincode}
                  <button type="button" onClick={() => setPincode('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {bestTime && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-0.5 text-tag text-mithila-text">
                  Time: {bestTime}
                  <button type="button" onClick={() => setBestTime('')} className="text-mithila-muted hover:text-mithila-text">
                    <PiX aria-hidden="true" className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="press ml-1 text-[11px] font-semibold text-mithila-primary underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Category horizontal scroll bar */}
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          <FilterPill label="All" value="" selected={!categorySlug} onClick={setCategorySlug} />
          {categories.map((cat) => (
            <FilterPill
              key={cat.slug}
              label={cat.name}
              value={cat.slug}
              selected={categorySlug === cat.slug}
              onClick={setCategorySlug}
            />
          ))}
        </div>
      </div>

      {/* Results */}
      <main id="spots-feed" className="mx-auto max-w-screen-xl px-edge py-6">
        <HotSpotsBanner />

        <div className="mb-4">
          <h1 className="font-handwritten text-display text-mithila-text">
            {categorySlug
              ? bySlug.get(categorySlug)?.name ?? 'Spots'
              : city
              ? `Spots in ${city}`
              : 'Spots'}
          </h1>
        </div>

        {loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <ErrorState
            error={error}
            onRetry={() => {
              setPage(1);
              setItems([]);
            }}
          />
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="No spots found"
            description={
              hasActiveFilters
                ? 'Try clearing some filters or changing your search terms.'
                : 'No spots have been added yet.'
            }
            action={hasActiveFilters ? { label: 'Clear filters', onClick: resetFilters } : undefined}
          />
        )}

        {!loading && items.length > 0 && (
          <>
            <ul className="grid gap-4 lg:grid-cols-2">
              {items.map((spot, index) => (
                <li key={spot.id}>
                  <SpotCard
                    spot={spot}
                    category={bySlug.get(spot.category_slug)}
                    priority={index < 4}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/spot/${spot.id}`);
                    }}
                  />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  id="spots-load-more"
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
