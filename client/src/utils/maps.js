/** Patna city centre (PRD §7.2). */
export const PATNA_CENTER = { lat: 25.612, lng: 85.14 };
export const PATNA_ZOOM = 12;

/** Opens turn-by-turn in Google Maps: the spot's own link when curated, otherwise a built directions URL. */
export function directionsUrl(spot) {
  if (spot.gmap_link) return spot.gmap_link;
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

export function formatAddress(spot) {
  if (!spot) return '';
  return [spot.street, spot.landmark, spot.area, spot.city, spot.state, spot.pincode].filter(Boolean).join(', ');
}
