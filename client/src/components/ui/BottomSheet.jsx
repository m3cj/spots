import { useEffect, useRef } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  usePresence,
  useReducedMotion,
} from 'motion/react';
import { useDialog } from '@/hooks/useDialog';
import { snap } from '@/utils/motion';

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 500;

function SheetPanel({ onClose, label, footer, scrim, children }) {
  const panelRef = useRef(null);
  const releaseVelocity = useRef(0);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const y = useMotionValue(reduceMotion ? 0 : window.innerHeight);

  useDialog(panelRef, { open: true, onClose, lockScroll: scrim, trapFocus: scrim });

  // Overshoot-clamp (§8.6): the Snap spring may overshoot, but never lifts the sheet off the bottom edge.
  useEffect(() => y.on('change', (value) => value < 0 && y.set(0)), [y]);

  useEffect(() => {
    if (!reduceMotion) animate(y, 0, snap);
  }, [y, reduceMotion]);

  useEffect(() => {
    if (isPresent) return;
    if (reduceMotion) {
      safeToRemove();
      return;
    }
    const offscreen = (panelRef.current?.offsetHeight ?? window.innerHeight) + 48;
    // Hand the release velocity straight to the spring rather than restarting from rest.
    animate(y, offscreen, { ...snap, velocity: releaseVelocity.current, onComplete: safeToRemove });
  }, [isPresent, reduceMotion, safeToRemove, y]);

  const onDragEnd = (_, { offset, velocity }) => {
    if (offset.y > DISMISS_DISTANCE || velocity.y > DISMISS_VELOCITY) {
      releaseVelocity.current = velocity.y;
      onClose();
    } else {
      animate(y, 0, { ...snap, velocity: velocity.y });
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-modal lg:left-sidebar">
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal={scrim || undefined}
        aria-label={label}
        tabIndex={-1}
        style={{ y }}
        initial={{ opacity: reduceMotion ? 0 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduceMotion ? 0 : 1 }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: window.innerHeight }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        className="pointer-events-auto mx-auto flex max-h-[85dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-lg bg-mithila-card shadow-lg outline-none"
      >
        <div
          onPointerDown={(event) => dragControls.start(event)}
          className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-pill bg-mithila-border" />
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-edge ${
            footer ? 'pb-4' : 'pb-[calc(env(safe-area-inset-bottom,0px)+16px)]'
          }`}
        >
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-mithila-border bg-mithila-card px-edge pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
            {footer}
          </footer>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Spring-physics drag sheet — DESIGN-SYSTEM §8.6 / §14. Drag the handle down to dismiss.
 * By default it leaves the page behind it interactive (the map); set `scrim` for a blocking sheet.
 */
export default function BottomSheet({ open, onClose, label, footer, scrim = false, children }) {
  return (
    <AnimatePresence>
      {open && scrim && (
        <motion.div
          key="scrim"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-scrim bg-mithila-scrim"
        />
      )}
      {open && (
        <SheetPanel key="sheet" onClose={onClose} label={label} footer={footer} scrim={scrim}>
          {children}
        </SheetPanel>
      )}
    </AnimatePresence>
  );
}
