import { useEffect } from 'react';

const SITE_NAME = 'SpotS';
const DEFAULT_DESCRIPTION =
  'SpotS is a hand-picked guide to Patna: cafés, heritage sites, parks, ghats, bazaars and hidden gems, ranked by the people who live here.';

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (property) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets `document.title` and key meta/OG tags for the current route.
 *
 * @param {Object} options
 * @param {string}  options.title       — Page-level title (without the site name suffix).
 * @param {string}  [options.description] — Meta description; falls back to the site default.
 * @param {string}  [options.image]     — OG image URL (for deep-link pages like spot/:id).
 * @param {string}  [options.url]       — Canonical URL for OG; defaults to window.location.href.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, image, url }) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url ?? window.location.href, true);
    if (image) setMeta('og:image', image, true);

    return () => {
      // Restore the base title when the component unmounts (navigation away).
      document.title = `${SITE_NAME} — Discover Patna`;
    };
  }, [title, description, image, url]);
}
