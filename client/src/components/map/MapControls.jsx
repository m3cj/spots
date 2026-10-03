import { motion } from 'motion/react';
import { PiCornersOut, PiCrosshair, PiMinus, PiPlus, PiSpinnerGap } from 'react-icons/pi';
import { settle } from '@/utils/motion';

const BUTTON =
  'press flex h-11 w-11 items-center justify-center rounded-pill bg-mithila-card text-mithila-text shadow-md';

/**
 * Bottom-right stack (PRD §7.2): zoom (desktop only — touch uses pinch), my location, fit Patna.
 * Sits above the mobile FAB, and slides off-screen while the bottom sheet is open.
 */
export default function MapControls({ hidden = false, locating = false, onZoomIn, onZoomOut, onLocate, onFit }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, x: hidden ? 24 : 0 }}
      transition={settle}
      inert={hidden ? '' : undefined}
      className="absolute bottom-[88px] right-4 z-sticky flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      <div className="hidden flex-col overflow-hidden rounded-pill bg-mithila-card shadow-md lg:flex">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="press flex h-11 w-11 items-center justify-center text-mithila-text hover:bg-mithila-pill"
        >
          <PiPlus aria-hidden="true" className="h-5 w-5" />
        </button>
        <span aria-hidden="true" className="mx-2 h-px bg-mithila-border" />
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="press flex h-11 w-11 items-center justify-center text-mithila-text hover:bg-mithila-pill"
        >
          <PiMinus aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <button type="button" onClick={onLocate} aria-label="Show my location" disabled={locating} className={BUTTON}>
        {locating ? (
          <PiSpinnerGap aria-hidden="true" className="h-5 w-5 motion-safe:animate-spin" />
        ) : (
          <PiCrosshair aria-hidden="true" className="h-5 w-5" />
        )}
      </button>

      <button type="button" onClick={onFit} aria-label="Fit all of Patna" className={BUTTON}>
        <PiCornersOut aria-hidden="true" className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
