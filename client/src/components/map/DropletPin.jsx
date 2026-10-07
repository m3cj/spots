import { useId } from 'react';
import { motion } from 'motion/react';
import { snap } from '@/utils/motion';
import { useTheme } from '@/hooks/useTheme';
import { CategoryIcon } from '@/utils/categoryIcons';

// Seamless white circle on rectangular stem
const PIN_SHAPE = 'M 14.4 42.5 L 14.4 30.41 A 14.5 14.5 0 1 1 17.6 30.41 L 17.6 42.5 A 1.6 1.6 0 0 1 14.4 42.5 Z';

// Slightly under-damped Snap so the drop-in reads as a bounce (PRD §7.2 / DESIGN-SYSTEM §7.1).
const entrance = { ...snap, damping: 16 };

/**
 * Modern paddle/lollipop map pin (white circle on vertical rectangular stem).
 * Centered category icon rendered in the category's DB color.
 * The 44px wrapper keeps the touch target at the SpotS minimum (DESIGN-SYSTEM §9).
 */
export default function DropletPin({ color, icon, selected = false, delay = 0, label }) {
  const shadowId = useId();
  const { isDark } = useTheme();
  const pinColor = color ?? 'var(--primary-kumkum)';
  // Border: white in light mode, dark canvas color (--bg-canvas) in dark mode
  const borderColor = isDark ? 'var(--bg-canvas)' : '#FFFFFF';

  return (
    <motion.div
      initial={{ y: -28, scale: 0.4, opacity: 0 }}
      animate={{ y: 0, scale: selected ? 1.18 : 1, opacity: 1 }}
      transition={{ ...entrance, delay }}
      style={{ transformOrigin: '50% 100%' }}
      className="relative flex h-[52px] w-11 cursor-pointer items-end justify-center"
    >
      <motion.div
        animate={selected ? { rotate: [0, -8, 8, -4, 4, 0] } : { rotate: 0 }}
        transition={selected ? { duration: 0.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' } : { duration: 0 }}
        style={{ transformOrigin: '50% 100%' }}
        className="relative flex flex-col items-center"
      >
        <svg
          viewBox="0 0 32 44"
          width="32"
          height="44"
          role="img"
          aria-label={label}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id={shadowId} x="-30%" y="-15%" width="160%" height="150%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.22" />
            </filter>
          </defs>
          <path
            d={PIN_SHAPE}
            filter={`url(#${shadowId})`}
            fill={pinColor}
            stroke={borderColor}
            strokeWidth={selected ? 2.5 : 1.5}
          />
        </svg>

        {/* Category icon centered inside the colored circle head */}
        <div className="pointer-events-none absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
          <CategoryIcon
            name={icon}
            style={{ color: '#FFFFFF' }}
            className="h-[17px] w-[17px]"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
