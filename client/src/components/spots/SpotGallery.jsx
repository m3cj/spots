import { useEffect, useRef, useState } from 'react';
import { PiCaretLeft, PiCaretRight, PiImage } from 'react-icons/pi';

/**
 * Photo carousel — DESIGN-SYSTEM §8.14 (3:2, cover, first image eager, the rest lazy). Native scroll-snap so
 * swiping just works; arrows (desktop) and the counter follow the scroll position.
 * `images` is `[{ url, caption? }]`.
 */
export default function SpotGallery({ images, name }) {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return undefined;
    const onScroll = () => setIndex(Math.round(node.scrollLeft / node.clientWidth));
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/2] items-center justify-center rounded-sm bg-mithila-pill text-mithila-muted">
        <PiImage aria-hidden="true" className="h-10 w-10" />
        <span className="sr-only">No photos yet</span>
      </div>
    );
  }

  const goTo = (target) => {
    const node = scroller.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ left: target * node.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  const many = images.length > 1;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`Photos of ${name}`} className="relative">
      <div
        ref={scroller}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sm"
      >
        {images.map((image, position) => (
          <div
            key={image.url}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} of ${images.length}`}
            className="aspect-[3/2] w-full shrink-0 snap-start bg-mithila-pill"
          >
            <img
              src={image.url}
              alt={image.caption || (position === 0 ? name : `${name}, photo ${position + 1}`)}
              loading={position === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-2 rounded-pill bg-mithila-scrim px-2.5 py-1.5 text-tag text-white"
          >
            {index + 1} / {images.length}
          </span>
          {[
            { label: 'Previous photo', side: 'left-2', icon: PiCaretLeft, target: index - 1, disabled: index === 0 },
            { label: 'Next photo', side: 'right-2', icon: PiCaretRight, target: index + 1, disabled: index === images.length - 1 },
          ].map(({ label, side, icon: Icon, target, disabled }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={disabled}
              onClick={() => goTo(target)}
              className={`press absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-mithila-scrim text-white disabled:opacity-0 lg:flex ${side}`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </button>
          ))}
        </>
      )}
    </div>
  );
}
