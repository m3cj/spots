import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `load(signal)` on mount and whenever `deps` change; the previous request is aborted.
 * `data` from the last success stays available while a reload is in flight so lists don't flash empty.
 * `reload()` re-runs the request (wire it to an ErrorState's Retry button).
 */
export function useAsync(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, error: null, loading: true }));

    loadRef.current(controller.signal).then(
      (data) => setState({ data, error: null, loading: false }),
      (error) => {
        if (error?.name === 'AbortError') return;
        setState((current) => ({ ...current, error, loading: false }));
      },
    );

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, reload };
}
