import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiCaretDown, PiCheck, PiSquaresFour } from 'react-icons/pi';
import { CategoryIcon } from '@/utils/categoryIcons';
import { settle } from '@/utils/motion';

/**
 * Top-left category filter (PRD §7.2). A disclosure of toggle buttons rather than an ARIA listbox, so
 * it works with plain Tab / Enter. `value` is a category slug or 'all'. Slides off-screen while `hidden`.
 */
export default function MapCategoryDropdown({ categories, value, onChange, hidden = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const current = categories.find((category) => category.slug === value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  const choose = (slug) => {
    onChange(slug);
    setOpen(false);
  };

  return (
    <motion.div
      ref={rootRef}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, x: hidden ? -24 : 0 }}
      transition={settle}
      inert={hidden ? '' : undefined}
      className="absolute left-4 top-4 z-sticky lg:left-6 lg:top-6"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((state) => !state)}
        className="press flex min-h-[44px] items-center gap-2 rounded-pill bg-mithila-card px-4 text-button text-mithila-text shadow-md"
      >
        {current ? (
          <span style={{ color: current.color }}>
            <CategoryIcon name={current.icon} className="h-4 w-4" />
          </span>
        ) : (
          <PiSquaresFour aria-hidden="true" className="h-4 w-4 text-mithila-muted" />
        )}
        <span>{current?.name ?? 'All spots'}</span>
        <PiCaretDown
          aria-hidden="true"
          className={`h-4 w-4 text-mithila-muted motion-safe:transition-transform motion-safe:duration-settle ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={settle}
            aria-label="Filter map by category"
            className="absolute left-0 top-full mt-2 max-h-[60dvh] w-56 overflow-y-auto overscroll-contain rounded-sm bg-mithila-card py-1 shadow-md"
          >
            {[{ slug: 'all', name: 'All spots' }, ...categories].map((category) => {
              const selected = category.slug === value;
              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(category.slug)}
                    className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-[14px] hover:bg-mithila-pill ${
                      selected ? 'font-semibold text-mithila-text' : 'text-mithila-textSecondary'
                    }`}
                  >
                    {category.slug === 'all' ? (
                      <PiSquaresFour aria-hidden="true" className="h-4 w-4 shrink-0 text-mithila-muted" />
                    ) : (
                      <span style={{ color: category.color }} className="shrink-0">
                        <CategoryIcon name={category.icon} className="h-4 w-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    {selected && <PiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-mithila-primary" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
