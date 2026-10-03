import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { PiCheckCircleFill, PiInfoFill, PiWarningCircleFill, PiWarningFill, PiX } from 'react-icons/pi';
import { settle } from '@/utils/motion';

// DESIGN-SYSTEM §8.9: 3px left accent + matching icon per state.
const TONES = {
  success: { accent: 'border-l-state-success', icon: PiCheckCircleFill, color: 'text-state-success' },
  error: { accent: 'border-l-state-danger', icon: PiWarningCircleFill, color: 'text-state-danger' },
  warning: { accent: 'border-l-state-warning', icon: PiWarningFill, color: 'text-state-warning' },
  info: { accent: 'border-l-mithila-muted', icon: PiInfoFill, color: 'text-mithila-muted' },
};

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

/** One toast. Slides up with the Settle preset; swipe sideways to dismiss. Rendered by ToastProvider. */
const Toast = forwardRef(function Toast({ type = 'info', message, subtitle, action, onDismiss }, ref) {
  const tone = TONES[type] ?? TONES.info;
  const Icon = tone.icon;

  return (
    <motion.div
      ref={ref}
      role={type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={settle}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, { offset, velocity }) => {
        if (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY) onDismiss();
      }}
      className={`pointer-events-auto flex items-start gap-3 rounded-sm border-l-[3px] bg-mithila-card py-3 pl-3 pr-1 shadow-md ${tone.accent}`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${tone.color}`} />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-[14px] leading-snug text-mithila-text">{message}</p>
        {subtitle && <p className="mt-0.5 text-caption font-medium text-mithila-textSecondary">{subtitle}</p>}
        {action && (
          <button
            type="button"
            onClick={() => {
              onDismiss();
              action.onClick();
            }}
            className="press -ml-2 mt-0.5 inline-flex min-h-[44px] items-center px-2 text-button text-mithila-primary underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-muted hover:text-mithila-text"
      >
        <PiX aria-hidden="true" className="h-4 w-4" />
      </button>
    </motion.div>
  );
});

export default Toast;
