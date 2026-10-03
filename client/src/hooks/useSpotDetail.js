import { useCallback, useEffect, useRef, useState } from 'react';
import { addBookmark, getSpot, likeSpot, removeBookmark, unlikeSpot } from '@/api/public';
import { useAsync } from '@/hooks/useAsync';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/hooks/useToast';

/**
 * Loads one spot (the API also bumps its view counter) and owns the like / bookmark / share actions.
 * Likes and bookmarks are optimistic and roll back on failure; anonymous visitors get the sign-in prompt.
 */
export function useSpotDetail(id) {
  const { data, error, loading, reload } = useAsync((signal) => getSpot(id, { signal }), [id]);
  const { requireAuth } = useRequireAuth();
  const toast = useToast();
  const [spot, setSpot] = useState(null);
  const [pending, setPending] = useState({ like: false, bookmark: false });
  const spotRef = useRef(null);

  useEffect(() => {
    setSpot(data);
  }, [data]);
  spotRef.current = spot;

  const patchViewer = (key, value) =>
    setSpot((current) => current && { ...current, viewer: { ...current.viewer, [key]: value } });

  const toggleLike = useCallback(async () => {
    const current = spotRef.current;
    if (!current || pending.like) return;
    if (!requireAuth('Sign in to like spots and help others find the best of Patna.')) return;

    const wasLiked = current.viewer.liked;
    setPending((state) => ({ ...state, like: true }));
    setSpot({ ...current, like_count: Math.max(current.like_count + (wasLiked ? -1 : 1), 0), viewer: { ...current.viewer, liked: !wasLiked } });

    try {
      const result = await (wasLiked ? unlikeSpot(current.id) : likeSpot(current.id));
      setSpot((latest) => latest && { ...latest, like_count: result.like_count, viewer: { ...latest.viewer, liked: result.liked } });
    } catch (failure) {
      setSpot(current);
      toast.error(wasLiked ? 'Couldn’t remove your like' : 'Couldn’t like this spot', {
        subtitle: failure.unreachable ? 'Check your connection and try again.' : failure.message,
      });
    } finally {
      setPending((state) => ({ ...state, like: false }));
    }
  }, [pending.like, requireAuth, toast]);

  const toggleBookmark = useCallback(async () => {
    const current = spotRef.current;
    if (!current || pending.bookmark) return;
    if (!requireAuth('Sign in to save spots to your bookmarks.')) return;

    const wasBookmarked = current.viewer.bookmarked;
    setPending((state) => ({ ...state, bookmark: true }));
    patchViewer('bookmarked', !wasBookmarked);

    try {
      await (wasBookmarked ? removeBookmark(current.id) : addBookmark(current.id));
      toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
    } catch (failure) {
      patchViewer('bookmarked', wasBookmarked);
      toast.error(wasBookmarked ? 'Couldn’t remove the bookmark' : 'Couldn’t save this spot', {
        subtitle: failure.unreachable ? 'Check your connection and try again.' : failure.message,
      });
    } finally {
      setPending((state) => ({ ...state, bookmark: false }));
    }
  }, [pending.bookmark, requireAuth, toast]);

  // Web Share API where available, clipboard otherwise (PRD §7.4). Always shares the /spot/:id deep link.
  const share = useCallback(async () => {
    const current = spotRef.current;
    if (!current) return;
    const url = `${window.location.origin}/spot/${current.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: current.name, text: `${current.name} on SpotS`, url });
      } catch (failure) {
        if (failure.name !== 'AbortError') toast.error('Couldn’t open the share sheet');
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Couldn’t copy the link', { subtitle: url });
    }
  }, [toast]);

  // useAsync keeps the previous result while a new id loads; never show another spot's data.
  const current = spot && String(spot.id) === String(id) ? spot : null;
  return { spot: current, error, loading: loading && !current, reload, pending, toggleLike, toggleBookmark, share };
}
