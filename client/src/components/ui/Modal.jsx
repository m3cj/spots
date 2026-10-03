import { useId, useRef } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { PiX } from 'react-icons/pi';
import { useDialog } from '@/hooks/useDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { settle, snap } from '@/utils/motion';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 600;

function ModalPanel({ onClose, title, footer, children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const dragControls = useDragControls();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useDialog(panelRef, { open: true, onClose });

  // Mobile: full-screen sheet that slides up (§8.6). Desktop: centred card that scales in from the centre.
  const motionProps = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      }
    : {
        initial: { opacity: 0, y: '100%' },
        animate: { opacity: 1, y: '0%' },
        exit: { opacity: 0, y: '100%' },
        drag: 'y',
        dragListener: false,
        dragControls,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.6 },
        dragTransition: { bounceStiffness: snap.stiffness, bounceDamping: snap.damping },
        onDragEnd: (_, { offset, velocity }) => {
          if (offset.y > DISMISS_DISTANCE || velocity.y > DISMISS_VELOCITY) onClose();
        },
      };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      transition={settle}
      className="pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-t-lg bg-mithila-card shadow-lg outline-none lg:h-auto lg:max-h-[85vh] lg:max-w-[560px] lg:rounded-md"
      {...motionProps}
    >
      {!isDesktop && (
        <div
          aria-hidden="true"
          onPointerDown={(event) => dragControls.start(event)}
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
        >
          <span className="h-1 w-10 rounded-pill bg-mithila-border" />
        </div>
      )}

      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-mithila-border py-1 pl-edge pr-2">
        <h2 id={titleId} className="min-w-0 truncate text-section text-mithila-text">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
        >
          <PiX aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-edge py-4">{children}</div>

      {footer && (
        <footer className="shrink-0 border-t border-mithila-border bg-mithila-card px-edge pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
          {footer}
        </footer>
      )}
    </motion.div>
  );
}

/**
 * Modal — DESIGN-SYSTEM §8.6. `footer` is the sticky action row; keep a destructive action ≥24px
 * (`gap-6`) away from the primary one. Closes on Escape, scrim click, the close button or a swipe down (mobile).
 */
export default function Modal({ open, onClose, onExitComplete, title, footer, children }) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
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
        <div key="panel" className="pointer-events-none fixed inset-0 z-modal flex items-stretch lg:items-center lg:justify-center lg:p-6">
          <ModalPanel onClose={onClose} title={title} footer={footer}>
            {children}
          </ModalPanel>
        </div>
      )}
    </AnimatePresence>
  );
}
