import { useCallback, useEffect, useState } from 'react';
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { PiCheck, PiCrosshair, PiMapPin, PiX } from 'react-icons/pi';
import MapsProvider, { MAP_ID, mapsConfigured } from '@/components/map/MapsProvider';
import Button from '@/components/ui/Button';
import { PATNA_CENTER, PATNA_ZOOM } from '@/utils/maps';
import { useToast } from '@/hooks/useToast';

function MapContent({ pin, setPin }) {
  const map = useMap();
  const toast = useToast();

  const handleMapClick = useCallback((e) => {
    if (e.detail?.latLng) {
      setPin({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  }, [setPin]);

  const handleDragEnd = useCallback((e) => {
    if (e.latLng) {
      setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [setPin]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPin(coords);
        if (map) {
          map.panTo(coords);
          map.setZoom(16);
        }
      },
      (err) => {
        toast.error('Could not get current location', { subtitle: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [map, setPin, toast]);

  const handleResetPatna = useCallback(() => {
    setPin(PATNA_CENTER);
    if (map) {
      map.panTo(PATNA_CENTER);
      map.setZoom(PATNA_ZOOM);
    }
  }, [map, setPin]);

  return (
    <div className="relative h-full w-full">
      <Map
        mapId={MAP_ID}
        defaultCenter={pin || PATNA_CENTER}
        defaultZoom={pin ? 15 : PATNA_ZOOM}
        onClick={handleMapClick}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full w-full"
      >
        {pin && (
          <AdvancedMarker
            position={pin}
            draggable
            onDragEnd={handleDragEnd}
            title="Spot location (drag to adjust)"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-mithila-primary text-white shadow-glow-red animate-bounce">
                <PiMapPin aria-hidden="true" className="h-6 w-6" />
              </div>
              <span className="mt-1 rounded-xs bg-mithila-card/90 px-1.5 py-0.5 text-[10px] font-semibold text-mithila-text shadow-sm backdrop-blur-none">
                Drag to adjust
              </span>
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Floating control buttons */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-10">
        <button
          type="button"
          onClick={handleLocateMe}
          title="Use my current location"
          className="press flex h-11 w-11 items-center justify-center rounded-pill border border-mithila-border bg-mithila-card text-mithila-text shadow-md hover:bg-mithila-pill"
        >
          <PiCrosshair aria-hidden="true" className="h-5 w-5 text-mithila-primary" />
        </button>
        <button
          type="button"
          onClick={handleResetPatna}
          title="Center on Patna"
          className="press flex h-11 w-11 items-center justify-center rounded-pill border border-mithila-border bg-mithila-card text-mithila-text shadow-md hover:bg-mithila-pill text-[12px] font-bold"
        >
          Patna
        </button>
      </div>

      {/* Instructions banner */}
      <div className="pointer-events-none absolute left-4 right-4 top-4 flex justify-center z-10">
        <div className="rounded-pill border border-mithila-border bg-mithila-card/95 px-4 py-2 text-caption text-mithila-text shadow-md">
          {pin ? 'Tap anywhere or drag the pin to adjust position' : 'Tap anywhere on the map to drop a pin'}
        </div>
      </div>
    </div>
  );
}

export default function LocationPickerModal({ open, initialLat, initialLng, onConfirm, onClose }) {
  const [pin, setPin] = useState(null);

  useEffect(() => {
    if (open) {
      if (initialLat != null && initialLng != null && !isNaN(Number(initialLat)) && !isNaN(Number(initialLng))) {
        setPin({ lat: Number(initialLat), lng: Number(initialLng) });
      } else {
        setPin(PATNA_CENTER);
      }
    }
  }, [open, initialLat, initialLng]);

  if (!open) return null;

  const handleConfirm = () => {
    if (pin) {
      onConfirm({
        lat: Number(pin.lat.toFixed(6)),
        lng: Number(pin.lng.toFixed(6)),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex flex-col bg-mithila-canvas">
      {/* Top Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-mithila-border bg-mithila-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location picker"
            className="press flex h-10 w-10 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiX aria-hidden="true" className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-body font-bold text-mithila-text">Pick Spot Location</h2>
            <p className="text-[12px] text-mithila-muted">
              {pin ? `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}` : 'No pin set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!pin}
          >
            <PiCheck aria-hidden="true" className="mr-1 h-4 w-4" />
            Confirm Location
          </Button>
        </div>
      </header>

      {/* Map body */}
      <main className="relative flex-1">
        {mapsConfigured ? (
          <MapsProvider>
            <MapContent pin={pin} setPin={setPin} />
          </MapsProvider>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <PiMapPin aria-hidden="true" className="h-12 w-12 text-mithila-primary mb-3" />
            <h3 className="text-section font-bold text-mithila-text mb-1">Google Maps Not Configured</h3>
            <p className="max-w-md text-caption text-mithila-muted mb-4">
              Enter coordinates manually below since VITE_GOOGLE_MAPS_API_KEY is not set.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                step="any"
                value={pin?.lat ?? ''}
                onChange={(e) => setPin((prev) => ({ ...prev, lat: Number(e.target.value) }))}
                placeholder="Latitude"
                className="h-10 rounded-xs border border-mithila-border bg-mithila-card px-3 text-[14px]"
              />
              <input
                type="number"
                step="any"
                value={pin?.lng ?? ''}
                onChange={(e) => setPin((prev) => ({ ...prev, lng: Number(e.target.value) }))}
                placeholder="Longitude"
                className="h-10 rounded-xs border border-mithila-border bg-mithila-card px-3 text-[14px]"
              />
            </div>
            <Button type="button" variant="primary" className="mt-4" onClick={handleConfirm}>
              Set Coordinates
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
