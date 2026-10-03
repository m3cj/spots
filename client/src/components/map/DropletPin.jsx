import { useId } from 'react';
import { motion } from 'motion/react';
import { snap } from '@/utils/motion';

const DROPLET = 'M16 1C7.7 1 1 7.6 1 15.8 1 26.4 16 41 16 41s15-14.6 15-25.2C31 7.6 24.3 1 16 1Z';

// Slightly under-damped Snap so the drop-in reads as a bounce (PRD §7.2 "bouncy entrance").
const entrance = { ...snap, damping: 16 };

/**
 * Droplet map pin coloured by the category's DB colour (PRD §7.2). The 44px wrapper keeps the touch target
 * at the SpotS minimum; the selected pin wiggles periodically. `delay` staggers the entrance.
 */
export default function DropletPin({ color, selected = false, delay = 0, label }) {
  const shadowId = useId();

  return (
    <motion.div
      initial={{ y: -28, scale: 0.4, opacity: 0 }}
      animate={{ y: 0, scale: selected ? 1.15 : 1, opacity: 1 }}
      transition={{ ...entrance, delay }}
      style={{ transformOrigin: '50% 100%' }}
      className="flex h-[52px] w-11 items-end justify-center"
    >
      <motion.svg
        viewBox="0 0 32 42"
        width="32"
        height="42"
        role="img"
        aria-label={label}
        animate={selected ? { rotate: [0, -9, 9, -5, 5, 0] } : { rotate: 0 }}
        transition={selected ? { duration: 0.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' } : { duration: 0 }}
        style={{ transformOrigin: '50% 100%', overflow: 'visible' }}
      >
        <defs>
          <filter id={shadowId} x="-30%" y="-10%" width="160%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="black" floodOpacity="0.3" />
          </filter>
        </defs>
        <path
          d={DROPLET}
          filter={`url(#${shadowId})`}
          style={{ fill: color ?? 'var(--primary-kumkum)', stroke: 'var(--surface-card)', strokeWidth: selected ? 2.5 : 1.5 }}
        />
        <circle cx="16" cy="15.5" r="5.5" className="fill-white" />
      </motion.svg>
    </motion.div>
  );
}
