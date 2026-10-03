import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCategories } from '@/api/public';

// Categories are DB-driven (PRD §6.2) and every surface needs them, so they are fetched once and shared.
let cache = null;
let inflight = null;

function loadCategories() {
  inflight ??= getCategories()
    .then((list) => {
      cache = list;
      return list;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Call after an admin edits categories so the next read refetches. */
export function invalidateCategories() {
  cache = null;
}

/** Returns the active categories (sorted by the API) plus a slug lookup. */
export function useCategories() {
  const [categories, setCategories] = useState(cache);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache) {
      setCategories(cache);
      return undefined;
    }
    let active = true;
    setError(null);
    loadCategories().then(
      (list) => active && setCategories(list),
      (failure) => active && setError(failure),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const bySlug = useMemo(() => new Map((categories ?? []).map((category) => [category.slug, category])), [categories]);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { categories: categories ?? [], bySlug, loading: !categories && !error, error, reload };
}
