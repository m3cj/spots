import { useEffect, useState } from 'react';
import { APILoadingStatus, AdvancedMarker, ColorScheme, Map, useApiLoadingStatus, useMap } from '@vis.gl/react-google-maps';
import { PiCrosshair } from 'react-icons/pi';
import DropletPin from '@/components/map/DropletPin';
import MapUnavailable from '@/components/map/MapUnavailable';
import MapsProvider, { MAP_ID, mapsConfigured } from '@/components/map/MapsProvider';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { PATNA_CENTER, PATNA_ZOOM } from '@/utils/maps';

const MAP_ID_PICKER = 'location-picker';

function toPoint(latLng) {
  const { lat, lng } = latLng.toJSON ? latLng.toJSON() : latLng;
  // 6 decimals is ~0.1m, matching what the DB float columns need.
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

function PickerSurface({ value, onChange, color, onFailed }) {
  const map = useMap(MAP_ID_PICKER);
  const status = useApiLoadingStatus();
  const { isDark } = useTheme();
  const toast = useToast();

  // Keep a programmatic change (preset, "my location") in view without fighting a drag the user is doing.
  useEffect(() => {
    if (!map || !value) return;
    const bounds = map.getBounds();
    if (!bounds || !bounds.contains(value)) map.panTo(value);
  }, [map, value]);

  const failed = status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE;
  useEffect(() => {
    if (failed) onFailed();
  }, [failed, onFailed]);

  if (failed) return null;

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.warning('Location isn’t available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({ lat: Number(coords.latitude.toFixed(6)), lng: Number(coords.longitude.toFixed(6)) });
        map?.setZoom(16);
      },
      () => toast.warning('Couldn’t read your location', { subtitle: 'Tap the map to place the pin instead.' }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="relative h-full w-full">
      <Map
        id={MAP_ID_PICKER}
        mapId={MAP_ID}
        defaultCenter={value ?? PATNA_CENTER}
        defaultZoom={value ? 15 : PATNA_ZOOM}
        colorScheme={isDark ? ColorScheme.DARK : ColorScheme.LIGHT}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        onClick={(event) => event.detail.latLng && onChange(toPoint(event.detail.latLng))}
        className="h-full w-full"
      >
        {value && (
          <AdvancedMarker
            position={value}
            draggable
            title="Drag to adjust the location"
            onDragEnd={(event) => event.latLng && onChange(toPoint(event.latLng))}
          >
            <DropletPin color={color} selected label="Selected location" />
          </AdvancedMarker>
        )}
      </Map>

      {!value && (
        <p className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-fit rounded-pill bg-mithila-scrim px-3 py-2 text-tag text-white">
          Tap the map to drop the pin
        </p>
      )}

      <button
        type="button"
        onClick={locateMe}
        aria-label="Use my current location"
        className="press absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-pill bg-mithila-card text-mithila-text shadow-md"
      >
        <PiCrosshair aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}

function CoordinateInputs({ value, onChange }) {
  const [draft, setDraft] = useState({ lat: value?.lat ?? '', lng: value?.lng ?? '' });

  const update = (key, text) => {
    const next = { ...draft, [key]: text };
    setDraft(next);
    const lat = Number(next.lat);
    const lng = Number(next.lng);
    if (next.lat !== '' && next.lng !== '' && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) onChange({ lat, lng });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {['lat', 'lng'].map((key) => (
        <label key={key} className="block text-[13px] font-medium text-mithila-textSecondary">
          {key === 'lat' ? 'Latitude' : 'Longitude'}
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={draft[key]}
            onChange={(event) => update(key, event.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xs border border-mithila-border bg-mithila-card px-3 text-mithila-text"
          />
        </label>
      ))}
    </div>
  );
}

/**
 * Embedded map with a draggable pin (PRD §7.8, §8.3). `value` is `{ lat, lng }` or null (nothing chosen yet);
 * `onChange` receives the new point. If Google Maps can't load, falls back to plain latitude/longitude inputs
 * so a form that needs a location is never blocked. `color` tints the pin with the chosen category.
 */
export default function LocationPicker({ value, onChange, color, invalid = false, describedBy, className = 'h-60' }) {
  const [failed, setFailed] = useState(false);

  if (!mapsConfigured || failed) {
    return (
      <div className="space-y-3">
        <MapUnavailable />
        <CoordinateInputs value={value} onChange={onChange} />
      </div>
    );
  }

  return (
    <div role="group" aria-label="Location on the map" aria-describedby={describedBy}>
      <div
        className={`overflow-hidden rounded-sm border ${invalid ? 'border-state-danger' : 'border-mithila-border'} ${className}`}
      >
        <MapsProvider>
          <PickerSurface value={value} onChange={onChange} color={color} onFailed={() => setFailed(true)} />
        </MapsProvider>
      </div>
      <p className="mt-2 text-caption text-mithila-muted" aria-live="polite">
        {value ? `Pin at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} — drag it to fine-tune.` : 'No location chosen yet.'}
      </p>
    </div>
  );
}
