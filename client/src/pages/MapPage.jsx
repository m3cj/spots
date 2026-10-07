import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APILoadingStatus, AdvancedMarker, ColorScheme, Map, useApiLoadingStatus, useMap } from '@vis.gl/react-google-maps';
import { getSpots } from '@/api/public';
import DropletPin from '@/components/map/DropletPin';
import MapBottomSheet from '@/components/map/MapBottomSheet';
import MapCategoryDropdown from '@/components/map/MapCategoryDropdown';
import MapControls from '@/components/map/MapControls';
import MapUnavailable from '@/components/map/MapUnavailable';
import MapsProvider, { MAP_ID, mapsConfigured } from '@/components/map/MapsProvider';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useSeo } from '@/hooks/useSeo';
import { PATNA_CENTER, PATNA_ZOOM } from '@/utils/maps';

const MAP_KEY = 'patna';
const PATNA_BOUNDS = { north: 25.67, south: 25.54, east: 85.27, west: 85.03 };
const MAX_PAGES = 5;

// The map needs every active spot, so walk the paginated list (server caps pageSize at 100).
async function loadAllSpots(signal) {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await getSpots({ page, pageSize: 100 }, { signal });
    items.push(...result.items);
    if (!result.hasMore) break;
  }
  return items;
}

// Centres the pin in the part of the map the bottom sheet leaves visible.
function panToSpot(map, spot) {
  const projection = map.getProjection();
  const zoom = map.getZoom();
  if (!projection || zoom == null) {
    map.panTo(spot);
    return;
  }
  const point = projection.fromLatLngToPoint(new google.maps.LatLng(spot.lat, spot.lng));
  point.y += (map.getDiv().clientHeight * 0.18) / 2 ** zoom;
  map.panTo(projection.fromPointToLatLng(point));
}

// Placeholder pins while spots load (DESIGN-SYSTEM §8.10 "map pins").
const SKELETON_PINS = [
  ['22%', '34%'],
  ['48%', '26%'],
  ['66%', '44%'],
  ['34%', '58%'],
  ['58%', '66%'],
  ['78%', '30%'],
];

function PinSkeletons() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {SKELETON_PINS.map(([left, top], index) => (
        <svg
          key={left + top}
          viewBox="0 0 32 44"
          style={{ left, top, animationDelay: `${index * 120}ms` }}
          className="absolute h-[44px] w-8 fill-mithila-pill motion-safe:animate-pulse"
        >
          <path d="M 14.4 42.5 L 14.4 30.41 A 14.5 14.5 0 1 1 17.6 30.41 L 17.6 42.5 A 1.6 1.6 0 0 1 14.4 42.5 Z" />
        </svg>
      ))}
    </div>
  );
}

function MapScreen({ spots, loading, error, onRetry }) {
  const map = useMap(MAP_KEY);
  const status = useApiLoadingStatus();
  const { isDark } = useTheme();
  const toast = useToast();
  const { categories, bySlug } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const deepLinkHandled = useRef(false);

  const visible = useMemo(
    () => (spots ?? []).filter((spot) => filter === 'all' || spot.category_slug === filter),
    [spots, filter],
  );
  const selected = visible.find((spot) => spot.id === selectedId) ?? null;

  const select = useCallback(
    (spot) => {
      setSelectedId(spot.id);
      if (map) panToSpot(map, spot);
    },
    [map],
  );

  // "Explore on Map" from a spot page links here as /?spot=ID.
  useEffect(() => {
    const wanted = Number(searchParams.get('spot'));
    if (deepLinkHandled.current || !wanted || !map || !spots) return;
    deepLinkHandled.current = true;
    const spot = spots.find((item) => item.id === wanted);
    if (spot) {
      setFilter('all');
      map.setZoom(15);
      select(spot);
    }
    setSearchParams({}, { replace: true });
  }, [map, spots, searchParams, setSearchParams, select]);

  const changeFilter = (slug) => {
    setFilter(slug);
    setSelectedId(null);
  };

  const locate = () => {
    if (!navigator.geolocation) {
      toast.warning('Location isn’t available on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        setUserPosition(position);
        setLocating(false);
        map?.setZoom(15);
        map?.panTo(position);
      },
      (failure) => {
        setLocating(false);
        toast.warning(failure.code === 1 ? 'Location permission is off' : 'Couldn’t find your location', {
          subtitle: failure.code === 1 ? 'Allow location access in your browser to use this.' : 'Try again in a moment.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  };

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="flex h-full items-center justify-center px-edge">
        <MapUnavailable className="w-full max-w-sm">
          <Button as={Link} to="/spots" variant="secondary" className="mt-3">
            Browse the spots list
          </Button>
        </MapUnavailable>
      </div>
    );
  }

  const sheetOpen = Boolean(selected);

  return (
    <>
      <Map
        id={MAP_KEY}
        mapId={MAP_ID}
        defaultCenter={PATNA_CENTER}
        defaultZoom={PATNA_ZOOM}
        minZoom={10}
        colorScheme={isDark ? ColorScheme.DARK : ColorScheme.LIGHT}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        onClick={() => setSelectedId(null)}
        className="h-full w-full"
      >
        {visible.map((spot, index) => {
          const category = bySlug.get(spot.category_slug);
          return (
            <AdvancedMarker
              key={spot.id}
              position={spot}
              title={spot.name}
              zIndex={spot.id === selectedId ? 1000 : undefined}
              onClick={() => select(spot)}
            >
              <DropletPin
                color={category?.color}
                icon={category?.icon}
                selected={spot.id === selectedId}
                delay={Math.min(index * 0.03, 0.6)}
                label={spot.name}
              />
            </AdvancedMarker>
          );
        })}

        {userPosition && (
          <AdvancedMarker position={userPosition} title="Your location">
            <span className="block h-4 w-4 rounded-pill border-2 border-white bg-mithila-primary shadow-glow-red" />
          </AdvancedMarker>
        )}
      </Map>

      {loading && <PinSkeletons />}

      {error && (
        <div className="absolute inset-x-4 top-20 z-sticky mx-auto max-w-sm rounded-md bg-mithila-card shadow-md">
          <ErrorState error={error} onRetry={onRetry} className="py-8" />
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <p
          role="status"
          className="absolute inset-x-0 top-20 z-sticky mx-auto w-fit rounded-pill bg-mithila-card px-4 py-2.5 text-[13px] text-mithila-textSecondary shadow-md"
        >
          No spots here yet
        </p>
      )}

      <MapCategoryDropdown categories={categories} value={filter} onChange={changeFilter} hidden={sheetOpen} />
      <MapControls
        hidden={sheetOpen}
        locating={locating}
        onZoomIn={() => map?.setZoom((map.getZoom() ?? PATNA_ZOOM) + 1)}
        onZoomOut={() => map?.setZoom((map.getZoom() ?? PATNA_ZOOM) - 1)}
        onLocate={locate}
        onFit={() => map?.fitBounds(PATNA_BOUNDS, 24)}
      />

      <MapBottomSheet
        spot={selected}
        category={selected ? bySlug.get(selected.category_slug) : null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

export default function MapPage() {
  const { data, error, loading, reload } = useAsync(loadAllSpots, []);
  useSeo({
    title: 'Map',
    description: 'Explore spots in Patna on an interactive map. Filter by category and tap any pin to see details.',
  });
  return (
    // Fills the viewport between the top edge and the bottom nav (the nav height is 0 on desktop).
    <div className="relative h-[calc(100dvh-var(--bottom-nav-total))] overflow-hidden bg-mithila-pill">
      <h1 className="sr-only">Map of spots in Patna</h1>
      {mapsConfigured ? (
        <MapsProvider>
          <MapScreen spots={data} loading={loading && !data} error={data ? null : error} onRetry={reload} />
        </MapsProvider>
      ) : (
        <div className="flex h-full items-center justify-center px-edge">
          <MapUnavailable className="w-full max-w-sm">
            <Button as={Link} to="/spots" variant="secondary" className="mt-3">
              Browse the spots list
            </Button>
          </MapUnavailable>
        </div>
      )}
    </div>
  );
}
