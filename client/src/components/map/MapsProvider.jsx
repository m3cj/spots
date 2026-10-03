import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/** Cloud Map ID — required for Advanced Markers and for the dark colour scheme. */
export const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

export const mapsConfigured = Boolean(API_KEY);

/**
 * Loads the Google Maps JS API once (the key is domain-restricted, PRD §9.4). Render children only when
 * `mapsConfigured`; otherwise show <MapUnavailable /> instead.
 */
export default function MapsProvider({ children }) {
  return (
    <APIProvider apiKey={API_KEY} language="en" region="IN">
      {children}
    </APIProvider>
  );
}
