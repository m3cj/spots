// Motion presets from DESIGN-SYSTEM §7.1. Animate transform and opacity only.
// The third preset, Press, is CSS (.press in index.css) so it works on every tappable element.

/** Toggles, knobs, draggable sheet settle. */
export const snap = { type: 'spring', stiffness: 480, damping: 30 };

/** Icon cross-fades, content swaps, modal enter. */
export const settle = { duration: 0.22, ease: [0.23, 1, 0.32, 1] };
